class StaticPagesController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:test_post]

  def home
  end

  def misc
  end

  def misc_bsb
    if params[:bsb].nil? or not logged_in?
      render plain: {error: "You must be logged in and send a BSB."}.to_json, status: 400
    else
      response = HTTParty.get("http://api.beliefmedia.com/bsb/"+params[:bsb]+".json")
      if response.code == 200
        render json: {
          data: JSON.parse(response.body)['data'],
          status: 200
        }.to_json
      else
        render json: {
          status: response.code,
          message: "An error occurred when trying to obtain the BSB details"
        }.to_json
      end
    end
  end

  def misc_card
    
  end

  def test_get
    render json: {
      you_sent: params
    }.to_json
  end

  def test_post
    render json: {
      you_sent: params
    }.to_json
  end
end
