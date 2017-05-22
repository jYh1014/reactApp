import React, {PropTypes as P} from 'react'; // React和ProTypes
import {connect} from 'react-redux'; // connect方法用于创建控制器组件，即数据和行为交由redux管理
import './split.styl';

/* 创建组件 */
class Split extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="split"></div>
    )
  }
}/* 代码类型检查 */
export default Split
