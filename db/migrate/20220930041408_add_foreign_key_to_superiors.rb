class AddForeignKeyToSuperiors < ActiveRecord::Migration[6.1]
  def change
    add_foreign_key :superiors, :users, column: :manager_id, primary_key: :id
    add_foreign_key :superiors, :users, column: :subordinate_id, primary_key: :id
    add_index :superiors, [:manager_id, :superior_id]
  end
end
