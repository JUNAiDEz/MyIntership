// src/pages/OurService.jsx

import React from 'react';
import styles from './OurService.module.css'; 

import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import ServiceBanner from '../../components/PageSections/ServiceBanner';

const serviceBannersData = [
  {
    id: 'gt7',
    imageUrl: '/images/FeatureBar/GT7.jpg',
    align: 'left',
  },
  {
    id: 'maintenance',
    imageUrl: '/images/FeatureBar/Maintenance.jpg',
    align: 'left',
    buttons: [ 
      { 
        text: 'ล้างท่อรวมไอดี', 
        link: '/services/pipe-cleaning',
        buttonImage: '/images/services/pipe-cleaning.jpg'
      },
      { 
        text: 'เปลี่ยนถ่ายของเหลว', 
        link: '/services/fluid-change',
        buttonImage: '/images/services/fluid-change.jpg'
      },
      { 
        text: 'สปาเครื่องยนต์', 
        link: '/services/engine-spa',
        buttonImage: '/images/services/engine-spa.jpg'
      },
      { 
        text: 'ล้างแอร์', 
        link: '/services/air-con',
        buttonImage: '/images/services/air-con.jpg'
      }
    ]
  },
  {
    id: 'fitment',
    imageUrl: '/images/FeatureBar/Fitment.jpg',
    align: 'right',
    buttons: [
      { 
        text: 'โหลดหน้า - หลัง',
        link: '/services/suspension',
        buttonImage: '/images/services/suspension.jpg'
      },
      { 
        text: 'โช๊คอัพ', 
        link: '/services/shock-absorber',
        buttonImage: '/images/services/shock-absorber.jpg'
      },
      { 
        text: 'ล้อแม็กซ์ - ยาง', 
        link: '/services/wheels-tyres',
        buttonImage: '/images/services/wheels-tyres.jpg'
      },
      { 
        text: 'ตั้งศูนย์', 
        link: '/services/alignment',
        buttonImage: '/images/services/alignment.jpg'
      },
      { 
        text: 'ลูกหมาก', 
        link: '/services/ball-joints',
        buttonImage: '/images/services/ball-joints.jpg'
      }
    ]
  },
  {
    id: 'upgrade',
    imageUrl: '/images/FeatureBar/Upgrade.jpg',
    align: 'left',
    buttons: [
      { 
        text: 'รีแมพ', 
        link: '/services/remap',
        buttonImage: '/images/services/remap.jpg'
      },
      { 
        text: 'ท่อแทน', 
        link: '/services/custom-exhaust',
        buttonImage: '/images/services/custom-exhaust.jpg'
      },
      { 
        text: 'เทอร์โบ อินเตอร์', 
        link: '/services/turbo-inter',
        buttonImage: '/images/services/turbo-inter.jpg'
      },
      { 
        text: 'แก้วาล์ว', 
        link: '/services/valve-service',
        buttonImage: '/images/services/valve-service.jpg'
      },
      { 
        text: 'รีโมทควบคุมระยะไกล', 
        link: '/services/remote-control',
        buttonImage: '/images/services/remote-control.jpg'
      }
    ]
  },
  {
    id: 'wrap',
    imageUrl: '/images/FeatureBar/Wrap.jpg',
    align: 'right',
    buttons: [ 
      { 
        text: 'ฟิลม์สีกันรอย', 
        link: '/services/film-protect',
        buttonImage: '/images/services/film-protect.jpg'
      },
      { 
        text: 'สติ๊กเกอร์', 
        link: '/services/sticker',
        buttonImage: '/images/services/sticker.jpg'
      },
      { 
        text: 'วัดบูส', 
        link: '/services/boost-gauge',
        buttonImage: '/images/services/boost-gauge.jpg'
      },
      { 
        text: 'ท่อ', 
        link: '/services/exhaust',
        buttonImage: '/images/services/exhaust.jpg'
      }
    ] 
  },
  {
    id: 'product',
    imageUrl: '/images/FeatureBar/Product.jpg',
    align: 'left',
    buttons: [ 
      { 
        text: 'GT7', 
        link: '/product/gt7',
        buttonImage: '/images/products/gt7.jpg'
      },
      { 
        text: 'STEP 1', 
        link: '/product/step-1',
        buttonImage: '/images/products/step-1.jpg'
      },
      { 
        text: 'Nano', 
        link: '/product/nano',
        buttonImage: '/images/products/nano.jpg'
      },
      { 
        text: 'Mmax', 
        link: '/product/mmax',
        buttonImage: '/images/products/mmax.jpg'
      },
      { 
        text: 'น้ำหอม', 
        link: '/product/perfume',
        buttonImage: '/images/products/perfume.jpg'
      }
    ] 
  }
];

function OurService({ onLogout }) {
  return (
    <div className="App">
      <Header onLogout={onLogout} />

      <main>
        {/* วนลูปแสดงแบนเนอร์ทั้งหมด */}
        {serviceBannersData.map(banner => {
          
          // --- 🌟 สร้างลิงก์สำหรับรูปภาพ ---
          // ถ้าเป็น 'product' ให้ไปหน้า Shop, ถ้าไม่ใช่ให้ไปหน้า Services ตาม ID
          const imageLink = (banner.id === 'product') 
            ? '/shop' 
            : `/services/${banner.id}`;

          return (
            <React.Fragment key={banner.id}> 
              
              {/* แถบขาวด้านบนของทุกรูป */}
              <div className={styles.topPadding}></div>

              <ServiceBanner 
                imageUrl={banner.imageUrl}
                title={banner.title}
                subtitle={banner.subtitle}
                buttons={banner.buttons}
                align={banner.align}
                // --- 🌟 ส่งลิงก์ไปให้ ServiceBanner ---
                imageLinkUrl={imageLink}
                omitOverlay={banner.id === 'gt7'}
              />
            </React.Fragment>
          );
        })}
        
        {/* แถบขาวปิดท้ายด้านล่างสุด */}
        <div className={styles.topPadding}></div>

      </main>

      <Footer />
    </div>
  );
}

export default OurService;