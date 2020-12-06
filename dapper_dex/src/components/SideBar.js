import React, { Component } from 'react';
// import 'react-pro-sidebar/dist/css/styles.css';
import './custom.scss'
// works with image.png
import Logo from '../img/image.png'
import { ProSidebar, Menu, MenuItem, SidebarContent, SidebarHeader, SidebarFooter, SubMenu} from 'react-pro-sidebar';
import { ArrowDownUp, WalletFill, CircleFill, Search, PersonFill, Wrench} from 'react-bootstrap-icons';
import {Image} from 'react-bootstrap'

class SideBar extends Component {

    render() {
        return (
            <ProSidebar>
                <SidebarHeader>
                <div style={{
                    padding: '24px', overflow: 'hidden'
                }}>
                <Image src = {Logo} fluid style={{height: 27, width: 27}}/>
                </div>


                    {/* <div
                    style={{
                        padding: '24px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        fontSize: 14, 
                        letterSpacing: '1px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                    >
                    Dashboard
                    </div> */}
                </SidebarHeader>
                
                
                 
                <SidebarContent>
                    <Menu iconShape="circle">
                    
                    {this.props.accountNum == '' ?  
                        <MenuItem onClick = {this.props.authenticateWallet} icon={<WalletFill />}>Connect Wallet</MenuItem> 
                    : 
                        <MenuItem icon={<WalletFill />}><b>{this.props.accountNum}</b></MenuItem>
                    }

                        <MenuItem  onClick = {this.props.gotoSetup} icon={<Wrench />}>Broseph</MenuItem>
                        <MenuItem icon={<PersonFill />}>Account</MenuItem>
                        <MenuItem icon={<Search />}>Overview</MenuItem>
                        {/* <ArrowDownUp size={30} color="gray"/> */}
                        <SubMenu
                            title="Pool"
                            icon={<CircleFill />}
                        >
                            <MenuItem onClick = {this.props.gotoPoolDeposit}>Add Liquidity</MenuItem>
                            <MenuItem onClick = {this.props.gotoPoolWithdraw}>Withdraw Liquidity</MenuItem>
                        </SubMenu>
                        {/* <MenuItem onClick = {this.props.gotoPool} icon={<CircleFill />}>Pool</MenuItem> */}
                        <MenuItem  onClick = {this.props.gotoSwap} icon={<ArrowDownUp />}>Swap</MenuItem>
                        {/* <SubMenu title="Components" icon={<FaHeart />}>
                        <MenuItem>Overview</MenuItem>
                        <MenuItem>Pool</MenuItem>
                        </SubMenu> */}
                    </Menu>
                </SidebarContent>

                <SidebarFooter style={{ textAlign: 'center' }}>
                    {/* <div className="sidebar-btn-wrapper"
                    style={{
                        padding: '20px 24px',
                    }}
                    > */}
                    {this.props.accountNum == '' ?  <pre></pre> :
                    
                    <Menu> 
                        <MenuItem>Bab Balance: <b>{this.props.babBalance}</b> </MenuItem>
                        <MenuItem>Flow Balance: <b>{this.props.flowBalance}</b> </MenuItem>
                        <MenuItem>LP Balance: <b>{this.props.lpBalance}</b> </MenuItem>
                        <hr color = "darkgray"/>
                        <MenuItem onClick = {this.props.unauthenticateWallet}>Log Out</MenuItem> 
                    </Menu>
                     
                    }
                    {/* </div> */}
                </SidebarFooter>
            </ProSidebar>
        );
    }
}


export default SideBar