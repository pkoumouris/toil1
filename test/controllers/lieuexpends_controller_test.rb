require "test_helper"

class LieuexpendsControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get lieuexpends_new_url
    assert_response :success
  end
end
