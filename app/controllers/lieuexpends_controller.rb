class LieuexpendsController < ApplicationController

  EXPENDITURE_WINDOW = (6.weeks + 1.day)
  # 

  def new
  end

  def available_toil_on_day
    if logged_in?
      day = Date.new(params[:year].to_i, params[:month].to_i, params[:day].to_i)
      #lieuexpends = Lieuexpend.where(user_id: current_user.id, start_at: (day - EXPENDITURE_WINDOW)..day)
      lieuexpends = Lieuexpend.where(user_id: current_user.id, start_at: (day-1.hour)..(day+1.hour))
      lieuaccruals = Lieuaccrual.where(status: 2, user_id: current_user.id, start_at: (day - EXPENDITURE_WINDOW)..day)
      render json: {
        lieuexpends: lieuexpends.map { |l| l.details_api },
        lieuaccruals: lieuaccruals.map { |l| l.details_api },
        available_leave: current_user.available_leave_from(day),
        success: true
      }.to_json
    else
      render plain: {error: "Not logged in"}.to_json, status: 400
    end
  end

  def expends_month_api
    if logged_in?
      start_date = Date.new(params[:year].to_i, params[:month].to_i, 1)
      end_date = Date.new(params[:month].to_i == 12 ? params[:year].to_i+1 : params[:year].to_i, params[:month].to_i + 1, 1)
      res = Lieuexpend.where(user_id: current_user, start_at: start_date..end_date).map { |l| l.details_api}
      render json: {
        results: res
      }.to_json
    else
      render plain: {error: "Not logged in"}.to_json, status: 400
    end
  end

  def destroy_api
    lieuexpend = Lieuexpend.find_by(id: params[:id].to_i)
    lieuexpend.lieuaccrual.update_attribute(:unexpended, lieuexpend.lieuaccrual.unexpended + lieuexpend.duration)
    if !!lieuexpend.destroy
      render json: {
        success: true
      }.to_json
    else
      render json: {
        success: false
      }.to_json
    end
  end

  def create_api
    lieuaccrual = Lieuaccrual.find_by(id: params[:accrualID].to_i)
    puts "LA"
    puts lieuaccrual.id
    if logged_in? and !lieuaccrual.nil?
      puts "A"
      date_start = Date.new(params[:year].to_i,params[:month].to_i,params[:day].to_i)
      puts date_start.rfc2822
      lieuexpend = lieuaccrual.lieuexpends.build(status: 1, start_at: date_start, start_minutes: params[:minutes].to_i, duration: params[:duration], user_id: current_user.id)
      puts "LE"
      if lieuexpend.save
        puts "B"
        render json: {
          saved: true,
          id: lieuexpend.id
        }.to_json
      else
        puts "C"
        render json: {
          saved: false
        }.to_json
      end
    else
      render plain: {error: "Not logged in"}.to_json, status: 400
    end
  end

  def expend_approvals
    if !logged_in?
      redirect_to root_url
    end
  end

  def expend_list_api
    if logged_in?
      subordinates = current_user.subordinates
      render json: {
        success: true,
        subordinates: subordinates.map { |s| {
          name: s.subordinate.name,
          email: s.subordinate.email,
          role: s.subordinate.role,
          status: s.subordinate.status,
          created_at: s.subordinate.created_at.rfc2822,
          expends: s.subordinate.lieuexpends.map { |l| l.details_api }
        } }
      }.to_json
    else
      render plain: {error: "Not logged in"}.to_json, status: 400
    end
  end

  def update_status_api
    lieuexpend = Lieuexpend.find_by(id: params[:id].to_i)
    if logged_in? and !Superior.where(manager: current_user, superior: lieuexpend.user).nil?
      lieuexpend.update_attribute(:status, params[:status])
      render json: {
        success: true
      }.to_json
    else
      render plain: {error: "You do not have sufficient permissions"}.to_json, status: 400
    end
  end

  def index
  end

  # This is the general method
  def expend_minutes
    if !logged_in?
      render plain: {error: "You do not have sufficient permissions"}.to_json, status: 400
    elsif params[:year].nil? || params[:month].nil? || params[:day].nil? || params[:minutes].nil?
      render plain: {error: "Insufficient parameters."}.to_json, status: 400
    else
      day = Date.new(params[:year].to_i,params[:month].to_i,params[:day].to_i)
      lieuaccruals = current_user.available_accruals_from(day)
      render json: {
        lieuaccruals: lieuaccruals.map { |l| l.details_api },
        minutes_available: current_user.available_leave_from(day)
      }.to_json
    end
  end

  def execute_expenditures
    # need :minutes, :lieuaccrual_id_list, :start_at, :year, :month, :day
    puts params
    if false
      puts params
      render json: {
        status: 201,
        success: true
      }.to_json
    elsif logged_in?
      lieuaccruals = params[:lieuaccrual_id_list].split(',').map { |id| Lieuaccrual.find_by(id: id.to_i) }
      sum = 0
      at = params[:start_minutes].to_i
      day = Date.new(params[:year].to_i,params[:month].to_i,params[:day].to_i)
      if day.nil?
        render plain: {error: "Wrong date format."}.to_json, status: 400
      else
        saved_lieuexpends = []
        lieuaccruals.each do |lieuaccrual|
          if lieuaccrual.user.id == current_user.id
            lieuexpend = lieuaccrual.lieuexpends.build(status: 1, start_at: day, start_minutes: at, duration: [lieuaccrual.duration, params[:minutes].to_i-sum].min, user_id: current_user.id)
            if lieuexpend.save
              saved_lieuexpends.push(lieuexpend)
            end
            lieuaccrual.update_attribute(:unexpended, lieuaccrual.unexpended - lieuexpend.duration)
            sum += [lieuaccrual.duration, params[:minutes].to_i - sum].min
          end
        end
        saved_lieuexpends.each do |lieuexpend|
          current_user.managers.each do |manager|
            user = manager.manager
            UserMailer.with(user: (Rails.env.development? ? User.first : user), lieuexpend: lieuexpend).lieuexpend_awaiting_approval.deliver_now
          end
        end
        if saved_lieuexpends.length == lieuaccruals.length
          render json: {
            success: true
          }.to_json
        else
          saved_lieuexpends.each do |lieuexpend|
            lieuexpend.destroy
          end
          render json: {
            success: false
          }.to_json
        end
      end
    else
      render plain: {error: "You must be logged in to view this."}.to_json, status: 400
    end
  end
  
end
