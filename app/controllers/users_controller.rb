class UsersController < ApplicationController
    def show
        @user = User.find_by(id: params[:id])
    end

    def details_api
        if logged_in?
            render json: {
                user: current_user.details_api
            }.to_json
        else
            render plain: {error: "You are not logged in."}.to_json, status: 400
        end
    end

    def employee_api
        if logged_in?
            user = User.find_by(id: params[:id].to_i)
            if user.id == current_user.id || current_user.is_manager_to?(user)
                render json: {
                    user: user.details_api
                }.to_json
            else
                render plain: {error: "You do not have permission to view that uuser."}.to_json, status: 400
            end
        else
            render plain: {error: "You are not logged in."}.to_json, status: 400
        end
    end

    def list
        if logged_in?
            @users = current_user.subordinates.map { |s| s.subordinate }
        else
            flash[:danger] = "You need to be logged in to view this page."
            redirect_to root_url
        end
    end

    def generate_report
    end

    def list_subordinates_api
        if logged_in?
            render json: {
                subordinates: current_user.subordinates.map { |s| {
                    id: s.subordinate.id,
                    name: s.subordinate.name,
                    role: s.subordinate.role,
                    email: s.subordinate.email
                } }
            }.to_json
        else
            render plain: {error: "You are not logged in."}.to_json, status: 400
        end
    end

    def change_password
        if !logged_in?
            redirect_to root_url
        else
            @user_status = current_user.status
        end
    end

    def change_password_api
        if logged_in?
            if current_user.status < 2
                current_user.update_attribute(:password, params[:password])
                flash[:success] = "Password successfully changed"
                render json: {
                    success: true
                }.to_json
            else
                if current_user.authenticate(params[:old_password])
                    current_user.update_attribute(:password, params[:password])
                    flash[:success] = "Password successfully changed"
                    render json: {
                        success: true
                    }.to_json
                else
                    render json: {
                        success: false,
                        errors: ["Old password was not correct"]
                    }.to_json
                end
            end
        else
            render plain: {error: "You are not logged in."}.to_json, status: 400
        end
    end

    def mass_import
    end

    def mass_import_api
        if logged_in? && current_user.status > 2
            params[:employees].each do |employee|
                user = User.new(name: employee[:name], email: employee[:email], role: employee[:role], password: employee[:password])
                user.save
                if employee[:superior_email] != 'null' && !employee[:superior_email].nil?
                    superior_user = User.find_by(email: employee[:superior_email])
                    user.assign_as_subordinate_to(superior_user)
                end
            end
            render json: {
                success: true
            }.to_json
        else
            render plain: {error: "You are not logged in."}.to_json, status: 400
        end
    end

    def get_all_subordinates
        if logged_in?
            render json: {
                subordinates: current_user.subordinates.map { |s| {
                    id: s.subordinate.id,
                    name: s.subordinate.name,
                    role: s.subordinate.role,
                    email: s.subordinate.email
                } },
                myself: {
                    id: current_user.id,
                    name: current_user.name,
                    role: current_user.role,
                    email: current_user.email
                }
            }
        else
            render plain: {error: "You are not logged in."}.to_json, status: 400
        end
    end

    def report_generator
    end

end
