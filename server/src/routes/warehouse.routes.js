import express from "express";
import {
    getWarehouses,
    createWarehouse,
    updateWarehouse,
    recordStockMovement,
    getWarehouseMovements,
    getWarehouseInventory
} from "../controllers/warehouse.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const warehouseRoutes = express.Router();

warehouseRoutes.use(protect);

// GET /api/warehouses
warehouseRoutes.get("/", authorizeRoles("admin", "viewer", "owner", "warehouse", "sales_manager", "purchasing", "accountant"), getWarehouses);

// POST /api/warehouses
warehouseRoutes.post("/", authorizeRoles("admin", "viewer", "owner"), createWarehouse);

// PUT /api/warehouses/:id
warehouseRoutes.put("/:id", authorizeRoles("admin", "viewer", "owner"), updateWarehouse);

// POST /api/warehouses/movement
warehouseRoutes.post("/movement", authorizeRoles("admin", "viewer", "owner", "warehouse"), recordStockMovement);

// GET /api/warehouses/:id/movements
warehouseRoutes.get("/:id/movements", authorizeRoles("admin", "viewer", "owner", "warehouse", "accountant"), getWarehouseMovements);

// GET /api/warehouses/:id/inventory
warehouseRoutes.get("/:id/inventory", authorizeRoles("admin", "viewer", "owner", "warehouse", "accountant"), getWarehouseInventory);

export default warehouseRoutes;
