class User < ApplicationRecord
    has_secure_password

    has_many :managers, :class_name => 'Superior', :foreign_key => 'subordinate_id'
    has_many :subordinates, :class_name => 'Superior', :foreign_key => 'manager_id'
    has_many :lieuaccruals
    has_many :lieuexpends

    EXPENDITURE_WINDOW = (6.months + 1.day)
    
    def assign_as_manager_to(user)
        if Superior.find_by(manager_id: user.id, subordinate_id: self.id).nil?
            if Superior.find_by(manager_id: self.id, subordinate_id: user.id).nil?
                return Superior.create(manager_id: self.id, subordinate_id: user.id)
            else
                return true
            end
        else
            # Cannot work because the relationship is reverse
            return false
        end
    end

    def assign_as_subordinate_to(user)
        if Superior.find_by(manager_id: self.id, subordinate_id: self.id).nil?
            if Superior.find_by(manager_id: user.id, subordinate_id: self.id).nil?
                return Superior.create(manager_id: user.id, subordinate_id: self.id)
            else
                return true
            end
        else
            # Cannot work because the relationship is reverse
            return false
        end
    end

    def remove_relationship_with(user)
        superiors = [Superior.find_by(manager_id: user.id, subordinate_id: self.id), Superior.find_by(manager_id: self.id, subordinate_id: user.id)]
        superiors.each do |superior|
            if !superior.nil?
                superior.destroy
            end
        end
    end

    def is_manager_to?(user)
        !Superior.find_by(manager_id: self.id, subordinate_id: user.id).nil?
    end

    def is_subordinate_to?(user)
        !Superior.find_by(manager_id: user.id, subordinate_id: self.id).nil?
    end


    # General method
    def manager
        self.managers.first
    end

    # Expository methods
    def details_api
        return {
            id: self.id,
            name: self.name,
            email: self.email,
            role: self.role,
            status: self.status,
            created_at: self.created_at.rfc2822,
            managers: self.managers.map { |m| {
                id: m.manager.id,
                name: m.manager.name,
                role: m.manager.role,
                email: m.manager.email
            } },
            subordinates: self.subordinates.map { |s| {
                id: s.subordinate.id,
                name: s.subordinate.name,
                role: s.subordinate.role,
                email: s.subordinate.email
            } },
            available_leave: self.available_leave
        }
    end

    def available_leave
        return self.determine_total_leave_accrued - self.determine_total_leave_taken
        #self.lieuaccruals.where("status = 2 AND unexpended > 0").map { |l| l.unexpended }.sum
    end

    def available_leave_from(time)
        self.lieuaccruals.where(["status = ? AND unexpended > ? AND start_at > ? AND start_at < ?", 2, 0, time-(EXPENDITURE_WINDOW), time]).map { |l| l.unexpended }.sum
    end

    def available_accruals_from(time)
        self.lieuaccruals.where(["status = ? AND unexpended > ? AND start_at > ? AND start_at < ?", 2, 0, time-(EXPENDITURE_WINDOW), time])
    end

    # Special particular methods
    def determine_total_leave_accrued
        sum = 0
        self.lieuaccruals.each do |accrual|
            sum += accrual.status > 1 ? accrual.duration : 0
        end
        self.update_attribute(:total_leave_accrued, sum)
        return sum
    end

    def determine_total_leave_taken
        sum = 0
        #self.lieuaccruals.each do |accrual|
        #    accrual.lieuexpends.each do |expend|
        #        sum += expend.duration
        #    end
        #end
        self.lieuexpends.each do |lieuexpend|
            sum += lieuexpend.duration
        end
        self.update_attribute(:total_leave_taken, sum)
        return sum
    end
end
