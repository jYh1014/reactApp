import React, { PropTypes as P } from 'react' // React和ProTypes
import { connect } from 'react-redux' // connect方法用于创建控制器组件，即数据和行为交由redux管理
import {Link} from 'react-router'
import cFetch from '../../utils/cFetch'
import './goods.styl'
import BScroll from 'better-scroll'
import reactMixin  from 'react-mixin'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import Cartcontrol from '../cartcontrol/Cartcontrol'
import ShopCart from '../shopcart/ShopCart'
import Food from '../food/Food'
import Immutable from 'immutable'
import { Map,fromJS} from 'immutable'

/* 创建组件 */
class Goods extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      goods: [],
      index: 0,
      _index: 0,
      count: 0,
      isShow: false
    };
    this.listHeight = [];
    this.scrollY = 0;
  }
  initScroll() {
    if (!this.meunScroll) {
      this.meunScroll = new BScroll(this.refs["menu-wrapper"],{
        click: true
      });
    }else{
      this.meunScroll.refresh();
    }
    if (!this.foodsScroll) {
      this.foodsScroll = new BScroll(this.refs["foods-wrapper"], {
        click: true,
        probeType: 3
      });
    }else {
      this.foodsScroll.refresh();
    }

    this.foodsScroll.on('scroll', (pos) => {
      this.scrollY = Math.abs(Math.round(pos.y));
      for (let i = 0; i < this.listHeight.length; i++) {
        let height1 = this.listHeight[i];
        let height2 = this.listHeight[i + 1];
        let menuList = this.refs["menu-wrapper"].getElementsByClassName('menu-item');
        if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
          for (let j = 0; j < menuList.length; j++) {
            if (j==i) {
              menuList[j].className = "menu-item current";
            }else{
              menuList[j].className = "menu-item";
            }
          }
          return i;
        }
      }
    });
  }

  componentDidMount() {
    cFetch('goods').then((data) => {
      let $$arr = Immutable.fromJS(data.jsonResult);
      let goods = $$arr.toJS();
      this.setState({'goods': goods});
    });
  }

  componentDidUpdate() {
    this.initScroll();
    this._calculateHeight();
  }

  _calculateHeight() {
      let foodList = this.refs["foods-wrapper"].getElementsByClassName('food-list-hook');
      let height = 0;
      this.listHeight.push(height);
      for (let i = 0; i < foodList.length; i++) {
        let item = foodList[i];
        height += item.clientHeight;
        this.listHeight.push(height);
      }
    }

  selectMenu(index){
    let foodList = this.refs["foods-wrapper"].getElementsByClassName('food-list-hook');
    let el = foodList[index];
    this.foodsScroll.scrollToElement(el, 300);
  }

  addCount(_index,index){
    let $$goods = Immutable.fromJS(this.state.goods[_index].foods[index]);
    let $$newGoods = $$goods.updateIn(['count'],(v = 0) => v + 1);
    this.state.goods[_index].foods[index] = $$newGoods.toJS();
    this.setState({goods:this.state.goods});
  }

  decreaseCount(_index,index){
    let $$goods = Immutable.fromJS(this.state.goods[_index].foods[index]);
    let $$newGoods = $$goods.updateIn(['count'],v => v - 1);
    this.state.goods[_index].foods[index] = $$newGoods.toJS();
    this.setState({goods:this.state.goods});
  }
  empty(){
    this.state.goods.map((good,_index) => {
        good.foods.map((food,index) => {
          if (food.count>=0){
            let $$goods = Immutable.fromJS(this.state.goods[_index].foods[index]);
            let $$newGoods = $$goods.updateIn(['count'],v => 0);
            this.state.goods[_index].foods[index] = $$newGoods.toJS();
          }
        })
      })

    this.setState({goods:this.state.goods});
  }

  addFirst(_index,index){
    let $$goods = Immutable.fromJS(this.state.goods[_index].foods[index]);
    let $$newGoods = $$goods.updateIn(['count'],v => 1);
    this.state.goods[_index].foods[index] = $$newGoods.toJS();
    this.setState({goods:this.state.goods});
  }

  show(_index,index){
    this.setState({isShow:true});
    this.setState({_index:_index,index:index});

  }
  hide(){
    this.setState({isShow:false});
  }
  render() {
    let classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
    return (
      <div>
      <div className = "goods">
        <div className = "menu-wrapper" ref = "menu-wrapper">
          <ul>
          {
            this.state.goods.map((item,index) => {
            return (
              <li  className={index==0?"menu-item current":"menu-item"} key = {index} onClick={this.selectMenu.bind(this,index)} >
                <span className="text border-1px">
                  <span className={item.type!=-1?"icon " + classMap[item.type]:"icon"}></span>{item.name}
                </span>
              </li>
              )
            })
          }
          </ul>
        </div>
        <div className="foods-wrapper" ref="foods-wrapper">
          <ul>
          {
            this.state.goods.map((good,_index) => {
              return (
                <li className="food-list food-list-hook" key={_index} >
                  <h1 className="title">{good.name}</h1>
                  <ul>
                    {
                      good.foods.map((food,index) => {
                        return (
                          <li className="food-item border-1px" key={index} >
                            <div className="icon" onClick={this.show.bind(this,_index,index)}>
                              <img width="57" height="57" src={food.icon} onClick={this.show.bind(this,_index,index)}/>
                            </div>
                            <div className="content">
                              <h2 className="name">{food.name}</h2>
                              <p className="desc">{food.description}</p>
                              <div className="extra">
                                <span className="count">月售{food.sellCount}份</span><span>好评率{food.rating}%</span>
                              </div>
                              <div className="price">
                                <span className="now">￥{food.price}</span>
                                {food.oldPrice?<span className="old">￥{food.oldPrice}</span>:''}
                              </div>
                              <div className="cartcontrol-wrapper" ref = "cartcontrol-wrapper">
                                <Cartcontrol  addCount={this.addCount.bind(this,_index,index)} decreaseCount = {this.decreaseCount.bind(this,_index,index)}  food = {food} _index = {_index} index = {index}/>
                              </div>
                            </div>
                          </li>
                        )
                      })
                    }
                  </ul>
                </li>
              )
            })

          }
          </ul>
        </div>
        <ShopCart goods = {this.state.goods} empty={this.empty.bind(this)} addCount={this.addCount.bind(this)} decreaseCount = {this.decreaseCount.bind(this)}/>
      </div>
      <Food show={this.state.isShow} hide = {this.hide.bind(this)}addFirst = {this.addFirst.bind(this,this.state._index,this.state.index)} goods = {this.state.goods} _index={this.state._index} index={this.state.index} addCount={this.addCount.bind(this,this.state._index,this.state.index)} decreaseCount = {this.decreaseCount.bind(this,this.state._index,this.state.index)}/>
      </div>
    );
  }
}

/* 代码类型检查 */
Goods.propTypes = {
  dispatch: P.func,
  children: P.any,
};
// reactMixin.onClass(Goods, PureRenderMixin)
export default Goods
