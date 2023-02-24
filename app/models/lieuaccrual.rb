class Lieuaccrual < ApplicationRecord
    belongs_to :user
    has_many :lieuexpends

    def details_api
        return {
            id: self.id,
            day_of_month: self.start_at.mday,
            status: self.status,
            duration: self.duration,
            start_minutes: self.start_minutes,
            leave_booked: self.leave_booked,
            date_accrued: self.start_at.rfc2822,
            date_accrued_int: self.start_at.to_i,
            created_at: self.created_at.rfc2822,
            available_minutes: self.available_minutes,
            description: self.description
        }
    end

    def leave_booked
        sum = 0
        self.lieuexpends.each do |l|
            sum += l.duration
        end
        return sum
    end

    def approve
        return self.update_attribute(:status, 2)
    end

    def available_minutes
        return self.duration - self.lieuexpends.map { |e| e.duration }.sum
    end

    def status_translation
        ["Unsubmitted","Pending","Approved","Rejected"][self.status]
    end

    
end
