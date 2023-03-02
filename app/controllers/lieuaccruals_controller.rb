class LieuaccrualsController < ApplicationController

  def new
  end

  def engagements_month_api
    if logged_in?
      start_date = Date.new(params[:year].to_i, params[:month].to_i, 1)
      end_date = Date.new(params[:month].to_i == 12 ? params[:year].to_i+1 : params[:year].to_i, params[:month].to_i + 1, 1)
      res = Lieuaccrual.where(start_at: start_date..end_date, user_id: current_user.id).map { |l| l.details_api}
      render json: {
        results: res
      }.to_json
    else
      render plain: {error: "Not logged in"}.to_json, status: 400
    end
  end

  def engagements_day_api
    if logged_in?
      date = Date.new(params[:year].to_i, params[:month].to_i, params[:day].to_i)
      res = current_user.available_accruals_from(date)#Lieuaccrual.where(start_at: date..(date+1.day), user_id: current_user.id).map { |l| l.details_api}
      render json: {
        results: res
      }
    else
      render plain: {error: "Not logged in"}.to_json, status: 400
    end
  end

  def create_api
    if logged_in?
      lieuaccrual = current_user.lieuaccruals.build(create_lieuaccrual_params)
      lieuaccrual.unexpended = lieuaccrual.duration
      if lieuaccrual.save
        begin
          current_user.managers.each do |manager|
            user = manager.manager
            UserMailer.with(user: (Rails.env.development? ? User.first : user), lieuaccrual: lieuaccrual).lieuaccrual_awaiting_approval.deliver_now
          end
        rescue
          puts "Error encountered in sending email"
        end
        render json: {
          created: true,
          id: lieuaccrual.id
        }.to_json
      else
        render json: {
          created: false
        }.to_json
      end
    else
      render plain: {error: "Not logged in"}.to_json, status: 400
    end
  end

  def accrual_approvals
    if !logged_in?
      redirect_to root_url
    end
  end

  def accrual_list_api
    if logged_in?
      subordinates = current_user.subordinates
      render json: {
        success: true,
        subordinates: subordinates.map { |s| {
          id: s.subordinate.id,
          name: s.subordinate.name,
          email: s.subordinate.email,
          role: s.subordinate.role,
          status: s.subordinate.status,
          created_at: s.subordinate.created_at.rfc2822,
          accruals: s.subordinate.lieuaccruals.map { |l| l.details_api }
        } }
      }.to_json
    else
      render plain: {error: "Not logged in"}.to_json, status: 400
    end
  end

  def update_status_api
    lieuaccrual = Lieuaccrual.find_by(id: params[:id].to_i)
    if logged_in? and !Superior.where(manager: current_user, superior: lieuaccrual.user).nil?
      lieuaccrual.update_attribute(:status, params[:status])
      render json: {
        success: true
      }.to_json
    else
      render plain: {error: "You do not have sufficient permissions"}.to_json, status: 400
    end
  end

  def index
    if logged_in?
      @lieuaccruals = current_user.lieuaccruals
    else
      flash[:danger] = "You must be logged in to view that page."
      redirect_to root_url
    end
  end

  def index_api
    if logged_in?
      if params[:user_id].nil?
        render json: {
          accruals: current_user.lieuaccruals.map { |l| l.details_api }
        }.to_json
      else
        user = User.find_by(id: params[:user_id].to_i)
        if current_user.is_manager_to?(user) || user.id == current_user.id
          render json: {
            accruals: user.lieuaccruals.map { |l| l.details_api }
          }.to_json
        else
          render plain: {error: "You do not have the authority to view this user."}.to_json, status: 400
        end
      end
    else
      render plain: {error: "You must be logged in to access this."}.to_json, status: 400
    end
  end

  def delete_api
    puts params
    lieuaccrual = Lieuaccrual.find_by(id: params[:id].to_i)
    if logged_in? and !lieuaccrual.nil? and current_user == lieuaccrual.user
      if !lieuaccrual.lieuexpends.map { |e| e.destroy }.include?(nil)
        if !!lieuaccrual.destroy
          render json: {
            success: true
          }.to_json
        else
          render json: {
            success: false,
            error: "Could not delete accrual."
          }.to_json
        end
      else
        render json: {
          success: false,
          error: "Could not delete all children."
        }.to_json
      end
    else
      render json: {
        success: false,
        error: "Not logged in or accrual is nil."
      }.to_json
    end
  end

  def get_by_conditions
    if logged_in?
      render json: {
        results: Lieuaccrual.where(params[:query]).map { |l| {
          id: l.id,
          status: l.status,
          start_at: l.start_at.rfc2822,
          start_minutes: l.start_minutes,
          duration: l.duration,
          user_id: l.user_id,
          created_at: l.created_at.rfc2822,
          unexpended: l.unexpended,
          description: l.description
        }}
      }
    else
      render plain: {error: "You must be logged in to access this."}.to_json, status: 400
    end
  end

  private
    def create_lieuaccrual_params
      params.require(:lieuaccrual).permit(:status, :start_at, :start_minutes, :duration, :description)
    end
end
