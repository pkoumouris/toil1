class UserMailer < ApplicationMailer
    default from: "parris.koumouris@acl.org.au"
    layout 'mailer'

    def lieuaccrual_awaiting_approval
        @user = params[:user]
        #@subordinate = params[:subordinate] # this is a user
        @lieuaccrual = params[:lieuaccrual]
        mail(to: @user.email, subject: @lieuaccrual.user.name+' has accrued TOL for you to review')
    end

    def lieuexpend_awaiting_approval
        @user = params[:user]
        @lieuexpend = params[:lieuexpend]
        mail(to: @user.email, subject: @lieuexpend.user.name+' has requested to take time off for you to review')
    end
end
