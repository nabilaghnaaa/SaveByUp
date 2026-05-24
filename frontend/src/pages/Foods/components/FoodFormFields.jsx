import {
  FOOD_CATEGORY_OPTIONS,
  FOOD_STATUS_OPTIONS,
  FOOD_UNIT_OPTIONS,
} from "../../../utils/foodStatus";

import "../styles/foodFormFields.css";

export default function FoodFormFields({ form, onChange }) {
  return (
    <div className="food-form-fields">
      <div className="food-field food-field-full">
        <label>Nama Makanan</label>
        <input
          type="text"
          value={form.name}
          placeholder="Contoh: Roti tawar, susu kotak, mie instan"
          onChange={(event) => onChange("name", event.target.value)}
        />
      </div>

      <div className="food-field">
        <label>Kategori</label>
        <select
          value={form.category}
          onChange={(event) => onChange("category", event.target.value)}
        >
          {FOOD_CATEGORY_OPTIONS.map((category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="food-field">
        <label>Jumlah Stok</label>
        <input
          type="number"
          min="1"
          value={form.quantity}
          onChange={(event) => onChange("quantity", event.target.value)}
        />
      </div>

      <div className="food-field">
        <label>Satuan</label>
        <select
          value={form.unit}
          onChange={(event) => onChange("unit", event.target.value)}
        >
          {FOOD_UNIT_OPTIONS.map((unit) => (
            <option value={unit} key={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      <div className="food-field">
        <label>Tanggal Kedaluwarsa</label>
        <input
          type="date"
          value={form.expiry_date}
          onChange={(event) => onChange("expiry_date", event.target.value)}
        />
      </div>

      <div className="food-field food-field-full">
        <label>Status Makanan</label>
        <select
          value={form.status}
          onChange={(event) => onChange("status", event.target.value)}
        >
          {FOOD_STATUS_OPTIONS.map((status) => (
            <option value={status.value} key={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <small>
          Status aman, mendekati kedaluwarsa, dan kedaluwarsa akan disesuaikan
          otomatis berdasarkan tanggal kedaluwarsa. Status seperti dijual,
          digunakan, dan dibuang dipakai untuk aksi manual.
        </small>
      </div>

      <div className="food-field food-field-full">
        <label>Keterangan</label>
        <textarea
          rows="4"
          value={form.note}
          placeholder="Contoh: masih tersegel, simpan di kulkas, dibeli kemarin, cocok untuk dijual murah..."
          onChange={(event) => onChange("note", event.target.value)}
        />
      </div>
    </div>
  );
}