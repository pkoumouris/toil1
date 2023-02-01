Rails.application.routes.draw do
  get 'lieuexpends/new'
  get 'lieuaccruals/new'
  get 'static_pages/home'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root 'static_pages#home'

  get '/login', to: 'sessions#new'
  post '/login', to: 'sessions#create'
  post '/logout', to: 'sessions#destroy'

  # User
  get '/user/:id', to: 'users#show'
  get '/api/me', to: 'users#details_api'
  get '/api/user/:id', to: 'users#employee_api'
  get '/employees/list', to: 'users#list'
  get '/api/employees/list', to: 'users#list_subordinates_api'
  get '/reports', to: 'users#generate_report'
  get '/changepassword', to: 'users#change_password'
  post '/changepassword', to: 'users#change_password_api'
  get '/massimport', to: 'users#mass_import'
  post '/massimport', to: 'users#mass_import_api'
  get '/allsubordinates', to: 'users#get_all_subordinates'
  get '/report', to: 'users#report_generator'

  # Lieuaccruals
  get '/accruals/new', to: 'lieuaccruals#new'
  get '/api/monthengagements', to: 'lieuaccruals#engagements_month_api'
  get '/api/dayengagements', to: 'lieuaccruals#engagements_day_api'
  post '/api/lieuaacrual/create', to: 'lieuaccruals#create_api'
  get '/accruals/approve', to: 'lieuaccruals#accrual_approvals'
  get '/api/lieuaccruals', to: 'lieuaccruals#accrual_list_api'
  post '/api/lieuaccrual/approve', to: 'lieuaccruals#update_status_api'
  get '/accruals/index', to: 'lieuaccruals#index'
  get '/api/accruals/index', to: 'lieuaccruals#index_api'
  post '/api/accrual/delete', to: 'lieuaccruals#delete_api'
  get '/api/accrual/search', to: 'lieuaccruals#get_by_conditions'

  # Lieuexpends
  get '/expends/new', to: 'lieuexpends#new'
  get '/api/monthexpends', to: 'lieuexpends#expends_month_api'
  get '/api/expends/dayquery', to: 'lieuexpends#available_toil_on_day'
  post '/api/expends/create', to: 'lieuexpends#create_api'
  post '/api/expends/destroy', to: 'lieuexpends#destroy_api'
  get '/expends/approve', to: 'lieuexpends#expend_approvals'
  get '/api/lieuexpends', to: 'lieuexpends#expend_list_api'
  post '/api/lieuexpend/approve', to: 'lieuexpends#update_status_api'
  get '/expends/index', to: 'lieuexpends#index'
  get '/api/expendminutes/create', to: 'lieuexpends#expend_minutes'
  post '/api/executeexpends', to: 'lieuexpends#execute_expenditures'

  get '/misc', to: 'static_pages#misc'
  get '/misc/bsb', to: 'static_pages#misc_bsb'
end
