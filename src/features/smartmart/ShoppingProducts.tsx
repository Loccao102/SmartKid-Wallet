import { Minus, Plus, ShoppingBasket } from 'lucide-react'
import { gameAssets } from '../../assets/registry'
import type { ProductDefinition, ProductStallId } from '../../domain/types'

export const money = new Intl.NumberFormat('vi-VN')
export const shopLabels: Record<ProductStallId, string> = {
  produce: 'Hoa quả',
  food: 'Đồ ăn',
  drinks: 'Đồ uống',
  supplies: 'Đồ dùng',
}

export function ProductImage({ product }: { product: ProductDefinition }) {
  const src = gameAssets.production.products[product.assetKey]
  return src ? (
    <img src={src} alt="" loading="lazy" width="200" height="160" />
  ) : (
    <ShoppingBasket size={40} aria-hidden="true" />
  )
}

export function QuantityControl({
  name,
  quantity,
  onAdd,
  onRemove,
  disableAdd = false,
}: {
  name: string
  quantity: number
  onAdd: () => void
  onRemove: () => void
  disableAdd?: boolean
}) {
  return (
    <div className="quantity-control" role="group" aria-label={'Số lượng ' + name}>
      <button
        type="button"
        aria-label={'Bớt ' + name}
        disabled={quantity === 0}
        onClick={onRemove}
      >
        <Minus size={18} />
      </button>
      <output aria-label={quantity + ' sản phẩm'}>{quantity}</output>
      <button
        type="button"
        aria-label={disableAdd ? name + ' đang tạm hết hàng' : 'Thêm ' + name}
        disabled={disableAdd}
        onClick={onAdd}
      >
        <Plus size={18} />
      </button>
    </div>
  )
}

export function ShoppingProduct({
  product,
  quantity = 0,
  onAdd,
  onRemove,
  unavailable = false,
}: {
  product: ProductDefinition
  quantity?: number
  onAdd?: () => void
  onRemove?: () => void
  unavailable?: boolean
}) {
  return (
    <article
      className={
        'shelf-product shelf-product-' +
        product.stallId +
        ' ' +
        (quantity ? 'in-basket ' : '') +
        (unavailable ? 'is-unavailable' : '')
      }
    >
      <div className="shelf-product-art">
        <ProductImage product={product} />
        {quantity > 0 ? (
          <span className="product-count">Trong giỏ: {quantity}</span>
        ) : null}
        {unavailable ? (
          <span className="product-unavailable">Tạm hết hàng</span>
        ) : null}
      </div>
      <div className="shelf-product-copy">
        <h3>{product.name}</h3>
        <p>
          <strong>{money.format(product.price)}đ</strong> / {product.unitLabel}
        </p>
        <span className="product-serves">Đủ cho {product.servesPeople} bạn</span>
      </div>
      {onAdd && onRemove ? (
        <QuantityControl
          name={product.name}
          quantity={quantity}
          onAdd={onAdd}
          onRemove={onRemove}
          disableAdd={unavailable}
        />
      ) : null}
    </article>
  )
}
