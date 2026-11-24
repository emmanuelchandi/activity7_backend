const router = require("express").Router();
const pool = require("../db");
const { MAX_ID, parseId, validateRecord } = require("../validate");

const COLUMNS = "id, title, category, description, status";

// Reads :id from the URL. Sends the error itself and returns null when it cannot continue.
function getId(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "The id must be a positive whole number." });
    return null;
  }
  if (id > MAX_ID) {
    res.status(404).json({ message: "Record not found." });
    return null;
  }
  return id;
}

// GET /api/records - read all records
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM records ORDER BY id`);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/records/:id - read one record
router.get("/:id", async (req, res, next) => {
  try {
    const id = getId(req, res);
    if (id === null) return;

    const result = await pool.query(`SELECT ${COLUMNS} FROM records WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/records - create a record (any id in the body is ignored)
router.post("/", async (req, res, next) => {
  try {
    const { value, error } = validateRecord(req.body);
    if (error) return res.status(400).json({ message: error });

    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) " +
        "VALUES ($1, $2, $3, $4) RETURNING *",
      [value.title, value.category, value.description, value.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/records/:id - replace the four editable fields (never creates a record)
router.put("/:id", async (req, res, next) => {
  try {
    const id = getId(req, res);
    if (id === null) return;

    const { value, error } = validateRecord(req.body);
    if (error) return res.status(400).json({ message: error });

    const result = await pool.query(
      "UPDATE records SET title = $1, category = $2, description = $3, status = $4 " +
        "WHERE id = $5 RETURNING *",
      [value.title, value.category, value.description, value.status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/records/:id - delete a record
router.delete("/:id", async (req, res, next) => {
  try {
    const id = getId(req, res);
    if (id === null) return;

    const result = await pool.query("DELETE FROM records WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
