import React from 'react';
import './FaceDetect.css';

const FaceDetect = ({ imageUrl, box }) => {
    return (
        <div className='center ma'>
            <div className='absolute mt2'>
                <img id='input-image' alt='' src={imageUrl} width='500px' heigh='auto'/>
                {box.map((boxitem)=>{ 
                    return (<div className="bounding-box"  key={boxitem.id} style={{top:boxitem.topRow, right:boxitem.rightCol, bottom:boxitem.bottomRow, left:boxitem.leftCol}}></div>); })
                }
            </div>
        </div>
    );
};

export default FaceDetect;