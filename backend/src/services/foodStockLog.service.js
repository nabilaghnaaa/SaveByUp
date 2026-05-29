const db = require("../config/db");

const cancelActiveMarketplaceByFood = async (
  foodId,
  userId,
  detachFood = false
) => {
  if (detachFood) {
    await db.query(
      `UPDATE marketplace_products
       SET 
        status = 'dibatalkan',
        quantity = 0,
        stock = 0,
        food_id = NULL
       WHERE food_id = ?
       AND seller_id = ?
       AND status IN ('tersedia', 'dalam_proses')`,
      [foodId, userId]
    );

    return;
  }

  await db.query(
    `UPDATE marketplace_products
     SET 
      status = 'dibatalkan',
      quantity = 0,
      stock = 0
     WHERE food_id = ?
     AND seller_id = ?
     AND status IN ('tersedia', 'dalam_proses')`,
    [foodId, userId]
  );
};

const getFoodMarketplaceState = async (foodId, userId) => {
  const [marketplaceRows] = await db.query(
    `SELECT
      COALESCE(
        SUM(
          CASE 
            WHEN status IN ('tersedia', 'dalam_proses') 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS active_marketplace_quantity,

      COALESCE(
        SUM(
          CASE 
            WHEN status = 'tersedia' 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS available_marketplace_quantity,

      COALESCE(
        SUM(
          CASE 
            WHEN status = 'dalam_proses' 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS process_marketplace_quantity
     FROM marketplace_products
     WHERE food_id = ?
     AND seller_id = ?`,
    [foodId, userId]
  );

  const [transactionRows] = await db.query(
    `SELECT COUNT(*) AS active_transactions
     FROM transactions t
     JOIN marketplace_products mp ON t.product_id = mp.id
     WHERE mp.food_id = ?
     AND mp.seller_id = ?
     AND t.status = 'waiting_cod'`,
    [foodId, userId]
  );

  return {
    activeMarketplaceQuantity: Number(
      marketplaceRows[0]?.active_marketplace_quantity || 0
    ),
    availableMarketplaceQuantity: Number(
      marketplaceRows[0]?.available_marketplace_quantity || 0
    ),
    processMarketplaceQuantity: Number(
      marketplaceRows[0]?.process_marketplace_quantity || 0
    ),
    activeTransactions: Number(transactionRows[0]?.active_transactions || 0),
  };
};

const enrichFoodWithMarketplaceState = async (food, userId) => {
  const state = await getFoodMarketplaceState(food.id, userId);

  return {
    ...food,
    active_marketplace_quantity: state.activeMarketplaceQuantity,
    available_marketplace_quantity: state.availableMarketplaceQuantity,
    process_marketplace_quantity: state.processMarketplaceQuantity,
    free_quantity: Math.max(
      Number(food.quantity || 0) - state.activeMarketplaceQuantity,
      0
    ),
  };
};

const enrichFoodsWithMarketplaceState = async (foods = [], userId) => {
  return Promise.all(
    foods.map((food) => enrichFoodWithMarketplaceState(food, userId))
  );
};

const getMarketplaceSummaryBySeller = async (userId) => {
  const [rows] = await db.query(
    `SELECT
      COALESCE(
        SUM(
          CASE 
            WHEN status IN ('tersedia', 'dalam_proses') 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS total_dijual,

      COALESCE(
        SUM(
          CASE 
            WHEN status = 'tersedia' 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS total_dijual_tersedia,

      COALESCE(
        SUM(
          CASE 
            WHEN status = 'dalam_proses' 
            THEN quantity 
            ELSE 0 
          END
        ), 
        0
      ) AS total_dalam_proses
     FROM marketplace_products
     WHERE seller_id = ?`,
    [userId]
  );

  return {
    total_dijual: Number(rows[0]?.total_dijual || 0),
    total_dijual_tersedia: Number(rows[0]?.total_dijual_tersedia || 0),
    total_dalam_proses: Number(rows[0]?.total_dalam_proses || 0),
  };
};

module.exports = {
  cancelActiveMarketplaceByFood,
  getFoodMarketplaceState,
  enrichFoodWithMarketplaceState,
  enrichFoodsWithMarketplaceState,
  getMarketplaceSummaryBySeller,
};