class CreateUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :users do |t|
      t.string :name
      t.string :email
      t.string :role
      t.integer :status
      t.string :password_digest
      t.string :confirm_digest
      t.string :remember_digest
      t.boolean :remember_me

      t.timestamps
    end
    add_index :companies, :handle, unique: true
  end
end
