import type {
  CartLine,
  MissionDefinition,
  MissionEvaluation,
  ProductDefinition,
  ProductStallId,
} from './types'

const emptyCoverage = (): Record<ProductStallId, number> => ({
  produce: 0,
  food: 0,
  drinks: 0,
  supplies: 0,
})

export function evaluateMission(
  mission: MissionDefinition,
  catalog: ProductDefinition[],
  cart: CartLine[],
  activeEventIds: string[] = [],
): MissionEvaluation {
  const productMap = new Map(catalog.map((product) => [product.id, product]))
  const coverageByStall = emptyCoverage()
  const activeIdSet = new Set(activeEventIds)
  const activeEvents = (mission.dynamicEvents ?? []).filter((event) =>
    activeIdSet.has(event.id),
  )
  const unavailableProductIds = Array.from(
    new Set(
      activeEvents
        .filter((event) => event.kind === 'product-unavailable')
        .flatMap((event) => event.productIds ?? []),
    ),
  )
  const unavailableSet = new Set(unavailableProductIds)
  const effectivePeople = Math.max(
    1,
    mission.people +
      activeEvents.reduce(
        (sum, event) =>
          sum +
          (event.kind === 'people-adjustment'
            ? (event.peopleDelta ?? 0)
            : 0),
        0,
      ),
  )
  const effectiveBudget = Math.max(
    0,
    mission.budget +
      activeEvents.reduce(
        (sum, event) =>
          sum +
          (event.kind === 'budget-adjustment'
            ? (event.budgetDelta ?? 0)
            : 0),
        0,
      ),
  )

  let spent = 0

  for (const line of cart) {
    if (line.quantity <= 0) continue

    const product = productMap.get(line.productId)
    if (!product) continue

    spent += product.price * line.quantity
    coverageByStall[product.stallId] += product.servesPeople * line.quantity
  }

  const remaining = effectiveBudget - spent
  const reasons: string[] = []
  const selectedProductIds = new Set(
    cart.filter((line) => line.quantity > 0).map((line) => line.productId),
  )

  if (spent > effectiveBudget) {
    reasons.push('Giỏ hàng vượt quá ngân sách hiện tại.')
  }

  if (remaining < mission.reserveRequired) {
    reasons.push(
      `Cần giữ lại ít nhất ${mission.reserveRequired.toLocaleString('vi-VN')}đ.`,
    )
  }

  for (const stallId of mission.requiredStalls) {
    if (coverageByStall[stallId] < effectivePeople) {
      reasons.push(
        `Gian ${stallId} mới đủ cho ${coverageByStall[stallId]}/${effectivePeople} bạn.`,
      )
    }
  }

  for (const line of cart) {
    if (line.quantity <= 0 || !unavailableSet.has(line.productId)) continue
    const product = productMap.get(line.productId)
    if (!product) continue
    reasons.push(
      `${product.name} vừa hết hàng. Em cần chọn phương án khác trước khi thanh toán.`,
    )
  }

  const softGoalResults = (mission.softGoals ?? []).map((goal) => {
    if (goal.kind === 'min-distinct-products') {
      return {
        id: goal.id,
        achieved: selectedProductIds.size >= (goal.target ?? 0),
      }
    }

    if (goal.kind === 'avoid-products') {
      const blocked = new Set(goal.productIds ?? [])
      return {
        id: goal.id,
        achieved: !cart.some(
          (line) => line.quantity > 0 && blocked.has(line.productId),
        ),
      }
    }

    return { id: goal.id, achieved: false }
  })

  return {
    success: reasons.length === 0,
    spent,
    remaining,
    coverageByStall,
    reasons,
    softGoalResults,
    activeEventIds: activeEvents.map((event) => event.id),
    effectivePeople,
    effectiveBudget,
    unavailableProductIds,
  }
}
