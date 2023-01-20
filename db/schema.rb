# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_10_17_231330) do

  create_table "companies", force: :cascade do |t|
    t.string "name"
    t.string "handle"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["handle"], name: "index_companies_on_handle", unique: true
  end

  create_table "lieuaccruals", force: :cascade do |t|
    t.integer "status"
    t.datetime "start_at"
    t.integer "start_minutes"
    t.integer "duration"
    t.integer "user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "unexpended"
    t.string "description"
    t.index ["user_id"], name: "index_lieuaccruals_on_user_id"
  end

  create_table "lieuexpends", force: :cascade do |t|
    t.integer "status"
    t.integer "lieuaccrual_id"
    t.datetime "start_at"
    t.integer "start_minutes"
    t.integer "duration"
    t.integer "user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["lieuaccrual_id"], name: "index_lieuexpends_on_lieuaccrual_id"
    t.index ["user_id"], name: "index_lieuexpends_on_user_id"
  end

  create_table "superiors", force: :cascade do |t|
    t.integer "manager_id"
    t.integer "subordinate_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index "\"manager_id\", \"superior_id\"", name: "index_superiors_on_manager_id_and_superior_id"
    t.index ["manager_id"], name: "index_superiors_on_manager_id"
    t.index ["subordinate_id"], name: "index_superiors_on_subordinate_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "role"
    t.integer "status"
    t.string "password_digest"
    t.string "confirm_digest"
    t.string "remember_digest"
    t.boolean "remember_me"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "total_leave_accrued"
    t.integer "total_leave_taken"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "lieuaccruals", "users"
  add_foreign_key "lieuexpends", "lieuaccruals"
  add_foreign_key "lieuexpends", "users"
  add_foreign_key "superiors", "users", column: "manager_id"
  add_foreign_key "superiors", "users", column: "subordinate_id"
end
