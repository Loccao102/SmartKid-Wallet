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
): MissionEvaluation {
  const productMap = new Map(catalog.map((product) => [product.id, product]))
  const coverageByStall = emptyCoverage()
  let spent = 0

  for (const line of cart) {
    if (line.quantity <= 0) continue

    const product = productMap.get(line.productId)
    if (!product) continue

    spent += product.price * line.quantity
    coverageByStall[product.stallId] += product.servesPeople * line.quantity
  }

  const remaining = mission.budget - spent
  const reasons: string[] = []
  const selectedProductIds = new Set(
    cart.filter((line) => line.quantity > 0).map((line) => line.productId),
  )

  if (spent > mission.budget) {
    reasons.push('Giỏ hàng vượt quá ngân sách.')
  }

  if (remaining < mission.reserveRequired) {
    reasons.push(
      `Cần giữ lại ít nhất ${mission.reserveRequired.toLocaleString('vi-VN')}đ.`,
    )
  }

  for (const stallId of mission.requiredStalls) {
    if (coverageByStall[stallId] < mission.people) {
      reasons.push(
        `Gian ${stallId} mới đủ cho ${coverageByStall[stallId]}/${mission.people} bạn.`,
      )
    }
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
  }
}
