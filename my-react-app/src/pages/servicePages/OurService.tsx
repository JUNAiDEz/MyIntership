// src/pages/OurService.jsx
// Hero Banner ขนาด 1920x1800
// ServiceBanner ขนาด 1200x800

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';

const serviceBannersData = [
  {
    id: 'gt7',
    // imageUrl: '/images/FeatureBar/GT7.jpg', 
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80', 
    align: 'left',
    title: 'CENTER OF EXCELLENCE', 
    subtitle: 'GT7 MOTORSPORT'
  },
  {
    id: 'maintenance',
    title: 'MAINTENANCE', 
    // imageUrl: '/images/FeatureBar/Maintenance.jpg',
    imageUrl: '/images/FeatureBar/mainternance.jpg',
    align: 'left',
    buttons: [ 
      { 
        text: 'ล้างท่อรวมไอดี', 
        link: '/services/pipe-cleaning',
        buttonImage: 'https://images.unsplash.com/photo-1597762696603-9d4825906d33?w=300&q=80' 
      },
      { 
        text: 'เปลี่ยนถ่ายของเหลว', 
        link: '/services/fluid-change',
        buttonImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&q=80'
      },
      { 
        text: 'สปาเครื่องยนต์', 
        link: '/services/engine-spa',
        buttonImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&q=80'
      },
      { 
        text: 'ล้างแอร์', 
        link: '/services/air-con',
        buttonImage: 'https://images.unsplash.com/photo-1632823469866-92f3b1b229f3?w=300&q=80'
      }
    ]
  },
  {
    id: 'fitment',
    title: 'FITMENT & SUSPENSION',
    // imageUrl: '/images/FeatureBar/Fitment.jpg',
    imageUrl: '/images/FeatureBar/Fitment.jpg',
    align: 'right',
    buttons: [
      { 
        text: 'โหลดหน้า - หลัง',
        link: '/services/suspension',
        buttonImage: 'https://images.unsplash.com/photo-1558211583-03ed8a0b3d5f?w=300&q=80'
      },
      { 
        text: 'โช๊คอัพ', 
        link: '/services/shock-absorber',
        buttonImage: 'https://images.unsplash.com/photo-1597762696603-9d4825906d33?w=300&q=80'
      },
      { 
        text: 'ล้อแม็กซ์ - ยาง', 
        link: '/services/wheels-tyres',
        buttonImage: 'https://images.unsplash.com/photo-1596700860882-74d173646540?w=300&q=80'
      },
      { 
        text: 'ตั้งศูนย์', 
        link: '/services/alignment',
        buttonImage: 'https://images.unsplash.com/photo-1579457631168-36c56b7c4d51?w=300&q=80'
      },
      { 
        text: 'ลูกหมาก', 
        link: '/services/ball-joints',
        buttonImage: 'https://images.unsplash.com/photo-1626370034458-755734509787?w=300&q=80'
      }
    ]
  },
  {
    id: 'upgrade',
    title: 'PERFORMANCE UPGRADE',
    // imageUrl: '/images/FeatureBar/Upgrade.jpg',
    imageUrl: '/images/FeatureBar/performance.jpg',
    align: 'left',
    buttons: [
      { 
        text: 'รีแมพ', 
        link: '/services/remap',
        buttonImage: 'https://images.unsplash.com/photo-1614216832677-4506c2794c48?w=300&q=80'
      },
      { 
        text: 'ท่อแทน', 
        link: '/services/custom-exhaust',
        buttonImage: 'https://images.unsplash.com/photo-1606577924004-6d9337536d5a?w=300&q=80'
      },
      { 
        text: 'เทอร์โบ อินเตอร์', 
        link: '/services/turbo-inter',
        buttonImage: 'https://images.unsplash.com/photo-1625231334168-35067f8853ed?w=300&q=80'
      },
      { 
        text: 'แก้วาล์ว', 
        link: '/services/valve-service',
        buttonImage: 'https://images.unsplash.com/photo-1597762696603-9d4825906d33?w=300&q=80'
      },
      { 
        text: 'รีโมทควบคุม', 
        link: '/services/remote-control',
        buttonImage: 'https://images.unsplash.com/photo-1558211583-03ed8a0b3d5f?w=300&q=80'
      }
    ]
  },
  {
    id: 'wrap',
    title: 'WRAP & PROTECTION',
    // imageUrl: '/images/FeatureBar/Wrap.jpg',
    imageUrl: '/images/FeatureBar/Wrap.jpg',
    align: 'right',
    buttons: [ 
      { 
        text: 'ฟิลม์สีกันรอย', 
        link: '/services/film-protect',
        buttonImage: 'https://images.unsplash.com/photo-1619551734325-81aaf323686c?w=300&q=80'
      },
      { 
        text: 'สติ๊กเกอร์', 
        link: '/services/sticker',
        buttonImage: 'https://images.unsplash.com/photo-1530026363249-37875b75890f?w=300&q=80'
      },
      { 
        text: 'วัดบูส', 
        link: '/services/boost-gauge',
        buttonImage: 'https://images.unsplash.com/photo-1626370034458-755734509787?w=300&q=80'
      },
      { 
        text: 'ท่อ', 
        link: '/services/exhaust',
        buttonImage: 'hhttps://images.unsplash.com/photo-1596700860882-74d173646540?w=300&q=80'
      }
    ] 
  },
  {
    id: 'product',
    title: 'GT7 PRODUCTS',
    // imageUrl: '/images/FeatureBar/Product.jpg',
    imageUrl: '/images/FeatureBar/Product.jpg',
    align: 'left',
    buttons: [ 
      { 
        text: 'GT7', 
        link: '/product/gt7',
        buttonImage: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=300&q=80'
      },
      { 
        text: 'STEP 1', 
        link: '/product/step-1',
        buttonImage: 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=300&q=80'
      },
      { 
        text: 'Nano', 
        link: '/product/nano',
        buttonImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&q=80'
      },
      { 
        text: 'Mmax', 
        link: '/product/mmax',
        buttonImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&q=80'
      },
      { 
        text: 'น้ำหอม', 
        link: '/product/perfume',
        buttonImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80'
      }
    ] 
  }
];

function OurService({ onLogout }: { onLogout?: () => void }) {
  const seo = {
    title: 'บริการของเรา | GT7 Motor',
    description: 'ศูนย์บริการรถยนต์ครบวงจร บริการซ่อมบำรุง ติดตั้งอุปกรณ์ ฟิล์มกันรอย รีแมพ ช่วงล่าง',
    url: 'https://front.gt7dev.com/ourservices',
    image: 'https://front.gt7dev.com/og-image-services.jpg'
  };

  const heroBanner = serviceBannersData.find((b: any) => b.id === 'gt7');
  const serviceList = serviceBannersData.filter((b: any) => b.id !== 'gt7');

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg-main text-text-main transition-colors duration-300">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <div className="sticky top-0 z-[9999]">
        <Header onLogout={onLogout} />
      </div>

      <main>
        {/* 1. Hero Section */}
        {heroBanner && (
          <section
            className="relative flex h-[60vh] min-h-[400px] items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${heroBanner.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-bg-main"></div>
            <div className="relative z-[2] px-5 text-center">
              <span className="mb-[15px] inline-block skew-x-[-10deg] bg-accent px-[25px] py-[5px] text-[1.2rem] font-extrabold tracking-[1px] text-black">{heroBanner.subtitle || 'GT7 MOTORSPORT'}</span>
              <h1 className="m-0 text-[2.5rem] font-black italic uppercase leading-[1.1] text-white [text-shadow:0_0_20px_rgba(0,0,0,0.8)] md:text-[4rem]">{heroBanner.title || 'OUR SERVICES'}</h1>
            </div>
          </section>
        )}

        {/* 2. Loop Service Sections */}
        {serviceList.map((service: any) => {
          const isAlignRight = service.align === 'right';

          return (
            <section
              key={service.id}
              className={`group relative flex min-h-[500px] flex-col flex-wrap border-b border-themed bg-bg-card transition-colors max-md:h-auto md:min-h-[500px] ${isAlignRight ? 'md:flex-row-reverse' : 'md:flex-row'}`}
            >
              {/* Image Side */}
              <div
                className={`relative min-w-[350px] flex-1 bg-cover bg-center transition-all duration-500 [filter:grayscale(80%)_brightness(0.7)] group-hover:[filter:grayscale(0%)_brightness(1)] max-md:h-[250px] max-md:min-h-[250px] max-md:w-full max-md:flex-none max-md:[clip-path:none] ${isAlignRight ? 'md:[clip-path:polygon(10%_0,100%_0,100%_100%,0%_100%)]' : 'md:[clip-path:polygon(0_0,100%_0,90%_100%,0%_100%)]'}`}
                style={{ backgroundImage: `url(${service.imageUrl})` }}
              />

              {/* Content Side */}
              <div className="relative flex min-w-[350px] flex-1 flex-col justify-center bg-transparent p-[40px_20px] max-md:min-w-0 md:p-[60px_50px]">
                <h2
                  data-title={service.title || service.id.toUpperCase()}
                  className="relative m-0 mb-[25px] text-[2rem] font-black italic uppercase leading-none text-transparent [-webkit-text-stroke:1px_var(--text-muted)] after:absolute after:left-0 after:top-0 after:text-text-accent after:[-webkit-text-stroke:0] after:[content:attr(data-title)] after:[filter:drop-shadow(0_0_10px_rgba(255,199,9,0.2))] md:mb-10 md:text-[3.5rem]"
                >
                  {service.title || service.id.toUpperCase()}
                </h2>

                {/* Grid ปุ่มบริการ (Cinematic Card) */}
                <div className="mt-[30px] grid grid-cols-2 gap-2.5 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-5">
                  {service.buttons && service.buttons.map((btn: any, btnIndex: number) => (
                    <Link
                      to={btn.link}
                      key={btnIndex}
                      className="group/item relative flex h-[110px] items-center justify-center overflow-hidden rounded-lg border border-themed bg-cover bg-center bg-no-repeat no-underline shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-[5px] hover:border-accent hover:shadow-[0_10px_20px_rgba(0,0,0,0.2),0_0_15px_rgba(255,199,9,0.2)] md:h-[150px]"
                      style={{ backgroundImage: `url(${btn.buttonImage || 'https://via.placeholder.com/300'})` }}
                    >
                      <div className="absolute inset-0 z-[1] bg-black/75 transition-all duration-300 group-hover/item:bg-black/30"></div>
                      <span className="relative z-[2] px-[15px] text-center text-[0.9rem] font-bold uppercase tracking-[1px] text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.9)] transition-all duration-300 group-hover/item:scale-110 group-hover/item:[text-shadow:0_0_15px_rgba(255,199,9,0.8)] md:text-[1.2rem]">{btn.text}</span>
                    </Link>
                  ))}
                </div>

              </div>
            </section>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}

export default OurService;