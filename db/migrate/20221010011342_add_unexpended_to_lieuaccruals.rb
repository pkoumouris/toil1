class AddUnexpendedToLieuaccruals < ActiveRecord::Migration[6.1]
  def change
    add_column :lieuaccruals, :unexpended, :integer
  end
end
