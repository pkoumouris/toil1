class Lieuexpend < ApplicationRecord
  belongs_to :lieuaccrual
  belongs_to :user

  def details_api
    return {
      id: self.id,
      status: self.status,
      start_at: self.start_at.rfc2822,
      start_minutes: self.start_minutes,
      duration: self.duration,
      lieuaccrual_id: self.lieuaccrual_id
    }
  end

  def expenditure_window
    (6.weeks + 1.day)
  end
end
