import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

class Test extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

export default Test;