class AddDescriptionToAccrual < ActiveRecord::Migration[6.1]
  def change
    add_column :lieuaccruals, :description, :string
    add_column :users, :total_leave_accrued, :integer
    add_column :users, :total_leave_taken, :integer
  end
end
