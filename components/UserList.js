/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from '@/styles/index.module.css';
import Link from 'next/link';
import axios from 'axios';

import SkillChain from '../artifacts/contracts/SkillChain.sol/SkillChain.json';
import {contractAddress} from '../config';

const MUMBAI_INFURA = process.env.MUMBAI_INFURA;

export default function UserList (){
      
  const [users, setUsers] = useState([]);
  const [loadingState, setLoadingState] = useState('');

  async function fetchUsers() {        
    alert('Please wait for list to load');
    try{
        
      const provider = new ethers.providers.JsonRpcProvider(MUMBAI_INFURA);
      //const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
      //const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
      const contract = new ethers.Contract(contractAddress, SkillChain.abi, provider);

      const numUsers = await contract.getNumberOfUsers();

      const users = [];
      for (let i = 0; i < numUsers; i++) {
        const user = await contract.getAllUsers();
        if (parseInt(user[i].id) !== 0) {          
          const meta = await axios.get(user[i].metaurl);
          users.push({
            id: parseInt(user[i].id),
            name: meta.data.name,
            location: meta.data.location,
            jobdescription: meta.data.jobdescription,
            image: meta.data.image
          });
        }
      }
      setUsers(users); 
      setLoadingState('loaded'); 
    }
    catch(e){
      console.log(e);
      alert('Error loading list',e);
    }     
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  if(loadingState === 'loaded' && !users.length)
  {
    return(
      <div className={`${styles.container} ${styles.mt2xl} ${styles.mb2xl}`}>
        <div className={styles.row}>
          <div className={`${styles.column} ${styles.aligncenter}`}>
            <h2 className={`${styles.maxwlg} ${styles.textcenter} ${styles.textwhite}`}>No users registered yet</h2>
            <p className={`${styles.textlg} ${styles.textcenter} ${styles.maxwmd} ${styles.textwhite}`}>
              Be the first to &nbsp;
              <Link href='/signup' className={`${styles.u} ${styles.mrlg} ${styles.textwhite}`}>
                Sign Up
              </Link> 
              <br/> 
              &nbsp;You can also&nbsp;
              <Link href='/accountlist?type=organizations' className={`${styles.u} ${styles.mrlg} ${styles.textwhite}`}>
                View Organizations
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  else{
    return (
      <>
        <div className={`${styles.container} ${styles.mt2xl} ${styles.mb2xl}`}>
          <div className={styles.row}>
            <div className={`${styles.column} ${styles.aligncenter}`}>
              <h2 className={`${styles.maxwlg} ${styles.textcenter} ${styles.textwhite}`}>List of Users</h2>
              <p className={`${styles.textlg} ${styles.textcenter} ${styles.maxwmd} ${styles.textwhite}`}>
                Don't have an account?&nbsp;
                <Link href='/signup' className={`${styles.u} ${styles.mrlg} ${styles.textwhite}`}>
                  Sign Up
                </Link> 
                <br/>You can also&nbsp; 
                <Link href='/accountlist?type=organizations' className={`${styles.u} ${styles.mrlg} ${styles.textwhite}`}>
                  View Organizations
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.cardlist}>
                {users.map((user, i) => (                  
                  <div className={styles.profilecard} key={i}>
                    <center><img src={user.image} alt="user profile" className={styles.profileimage} /></center>
                    <br/>
                    <center>
                      <p className={styles.notice}>{user.name}</p>
                      <p>{user.jobdescription}</p>
                      <p>{user.location}</p>
                      <p>
                        <Link href={`/userprofile?id=${user.id}`} className={`${styles.u} ${styles.mrlg} ${styles.textwhite}`}>
                          View Profile
                        </Link>
                      </p>
                    </center>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </>
    );
  }
}
