class SessionsController < ApplicationController
    def new
        if logged_in?
            redirect_to root_url
        end
    end

    def create
        user = User.find_by(email: params[:session][:email].downcase)
        if !user.nil?
            if user.authenticate(params[:session][:password])
                if user.status < 1
                    flash[:info] = "This account has not been confirmed"
                    redirect_to '/login'
                elsif user.status == 1
                    log_in(user)
                    flash[:info] = "Please update your password here."
                    redirect_to '/changepassword'
                else
                    log_in(user)
                    flash[:success] = "Logged in successfully"
                    redirect_to root_url
                end
            else
                flash[:danger] = "Failed to log in"
                redirect_to '/login'
            end
        else
            flash[:danger] = "Failed to log in"
            redirect_to '/login'
        end
    end

    def destroy
        if logged_in?
            log_out
            redirect_to root_url
        end
    end
end
