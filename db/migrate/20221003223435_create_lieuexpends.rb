class CreateLieuexpends < ActiveRecord::Migration[6.1]
  def change
    create_table :lieuexpends do |t|
      t.integer :status
      t.references :lieuaccrual, foreign_key: true
      t.datetime :start_at
      t.integer :start_minutes
      t.integer :duration
      t.references :user, foreign_key: true

      t.timestamps
    end
    # Create indices in next migration
  end
end
