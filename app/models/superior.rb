class Superior < ApplicationRecord
    belongs_to :manager, :class_name => 'User'
    belongs_to :subordinate, :class_name => 'User'
end
