/* eslint-disable @next/next/no-img-element */
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import SkillChain from '../artifacts/contracts/SkillChain.sol/SkillChain.json';
import {contractAddress} from '../config';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';

const MUMBAI_INFURA = process.env.MUMBAI_INFURA;

export default function Employees (){
  const router = useRouter();
  const { id } = router.query; 
  const [employees, setEmployees] = useState([]);
  const [loadingState, setLoadingState] = useState('');

  const fetchEmployees = useCallback(async () =>{
    try{
      // Connect to the network         
      const provider = new ethers.providers.JsonRpcProvider(MUMBAI_INFURA);
      //const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
      //const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
    
      //Load the contract        
      const contract = new ethers.Contract(contractAddress, SkillChain.abi, provider);
      const currentEmployees = await contract.curr_emp_of_organization(id);
      const orgEmployees = [];

      for (let i = 0; i < currentEmployees.length; i++) {
        const employee = await contract.employees(currentEmployees[i]);
        const meta = await axios.get(employee.metaurl);
        orgEmployees.push({
          id: parseInt(employee.id),
          name: meta.data.name,
          location: meta.data.location,
          position: meta.data.jobdescription,
          contactnum: meta.data.contactnum,
          image: meta.data.image,
          email: meta.data.email,
          role: employee.is_manager,
        });
      }
      setEmployees(orgEmployees); 
      setLoadingState('loaded');
    } 
    catch(e){
      console.log(e);
    }        
  }, [id]);
  

  useEffect(() => {
      fetchEmployees();
  }, [fetchEmployees]);

  async function editRole(employeeId) {
    try {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, SkillChain.abi, signer);
      const tx = await contract.editemployeerole(employeeId);
      const receipt = await tx.wait();
      if (receipt.status === 1) { 
        alert('Employee role updated successfully! Refresh Window');
      }
      console.log(`Transaction hash: ${tx.hash}`); 
      fetchEmployees();
    } 
    catch (err) {
      console.error('Error updating employee role:', err);
      alert('Error updating employee role');
    }
  }

  async function removeEmployee(employeeId) {
    try {
      // call the Solidity function
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, SkillChain.abi, signer);
      const tx = await contract.remove_employee(id, employeeId);
      const receipt = await tx.wait();
      if (receipt.status === 1) { 
        alert('Employee removed successfully! Refresh Window');
      }
      console.log(`Transaction hash: ${tx.hash}`);         
      fetchEmployees();
    } 
    catch (error) {
      console.error(error);
      alert('Error removing employee!');
    }
  }
  if(loadingState === 'loaded' && !employees.length)
    return <h1 className='font-medium text-lg text-white inline'>No employees</h1>
  else{
    return (
      <div>
        {employees.map((item) => {
          return (
            <div className='p-2 m-2 flex flex-row justify-around items-center bg-gray-800 border-solid rounded-lg ' key={item.id}>
              <div>
                <p className='text-white'>
                  <h1 className='font-medium text-lg text-white inline'>
                      {item.name}
                  </h1><br/>
                
                  Employee ID: {item.id} | Position: {item.position} | Location: {item.location}
                  <br/>
                  Contact: {item.contactnum} | Email: {item.email} | Role: {item.role ? 'Manager' : 'Employee'}
                  <br/>
                  <button
                    className='bg-green-800 hover:bg-green-700 text-white font-bold text-sm px-6 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                    onClick={() => editRole(item.id)}
                  >
                    Change Role
                  </button>
                  <button
                    className={
                      'bg-red-800 text-white active:bg-red-800 font-bold text-sm px-6 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150'
                    }
                    type='button'
                    onClick={() => removeEmployee(item.id)}>
                    Remove
                  </button>
                </p>
              </div>
              <div>
                  
                <img
                    src={item.image}
                    alt='Profile'
                    className='w-36 h-36 rounded-full object-cover object-center'
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }  
}