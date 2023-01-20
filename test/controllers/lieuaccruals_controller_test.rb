require "test_helper"

class LieuaccrualsControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get lieuaccruals_new_url
    assert_response :success
  end
end
