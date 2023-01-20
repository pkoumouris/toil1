class CreateLieuaccruals < ActiveRecord::Migration[6.1]
  def change
    create_table :lieuaccruals do |t|
      t.integer :status
      t.datetime :start_at
      t.integer :start_minutes
      t.integer :duration
      t.references :user, foreign_key: true

      t.timestamps
    end
    # Next migration
    # add_index :lieuaccruals, :start_at
    # add_index :lieuaccruals, [:status, :start_at]
  end
end
