import { getInventory, getLowStockProducts, getAllStockHistory } from "@/app/actions/inventory";
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory-config";
import InventoryClient from "./InventoryClient";

export const metadata = { title: "Inventory | Admin" };

export default async function InventoryPage() {
  const [inventory, lowStock, history] = await Promise.all([
    getInventory(),
    getLowStockProducts(),
    getAllStockHistory(100),
  ]);

  return (
    <InventoryClient
      inventory={inventory}
      lowStock={lowStock}
      history={history}
      threshold={LOW_STOCK_THRESHOLD}
    />
  );
}
