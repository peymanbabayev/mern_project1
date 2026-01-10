export default function ProductForm({ product }: { product: any }) {
    return (
        <div>
            <form>
                <input type="text" placeholder="Name" value={product.name} />
                <input type="text" placeholder="Description" value={product.description} />
                <input type="number" placeholder="Price" value={product.price} />
                <button type="submit">Save</button>
            </form>
        </div>
    )
}