import React, { Component } from 'react';
import Sidebar from '../../../components/HSidebar';
import AddProduct from '../Reporting-Products/AddProducts'; // Adjust the import path as needed

export default class Home extends Component {
  render() {
    return (
      <>
        <div className='flex'>
          <Sidebar />
          <div className='flex-grow ml-60 p-5'>
            <AddProduct />
          </div>
        </div>
      </>
    );
  }
}
