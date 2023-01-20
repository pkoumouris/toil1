import React from "react"
import PropTypes from "prop-types"
class HelloWorld extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      toggle: true
    };
  }
  render () {
    return (
      <div>
        Greeting: {this.props.greeting}<br />
        The toggle is {this.state.toggle ? "on" : "off"}<br />
        <button onClick={() => this.setState({toggle: !this.state.toggle})}>
          Toggle
        </button>
      </div>
    );
  }
}

HelloWorld.propTypes = {
  greeting: PropTypes.string
};
export default HelloWorld
