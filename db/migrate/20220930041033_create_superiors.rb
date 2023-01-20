class CreateSuperiors < ActiveRecord::Migration[6.1]
  def change
    create_table :superiors do |t|
      t.references :manager
      t.references :subordinate

      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
