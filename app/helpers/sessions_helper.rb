module SessionsHelper
    def log_in(user)
        session[:user_id] = user.id
        #token = SecureRandom.urlsafe_base64
        #cookies.permanent[:remember_token] = token
        #user.update_attribute(:remember_digest, User.digest(token))
    end

    def log_out
        session.delete(:user_id)
        @current_user = nil
    end

    def logged_in?
        !current_user.nil?
    end

    def current_user
        if (user_id = session[:user_id])
            @current_user ||= User.find_by(id: user_id)
        elsif (user_id = cookies.signed[:user_id])
            user = User.find_by(id: user_id)
            if user && user.status > 1
                log_in(user)
                @current_user = user
            end
        end
    end
end
