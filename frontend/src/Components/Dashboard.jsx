import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSchool,
  FaTint,
  FaToilet,
  FaHandsWash,
  FaCog,
  FaImages,
  FaLeaf,
  FaVenus,
  FaFirstAid,
  FaHeartbeat,
  FaUtensils,
  FaStar,
  FaChartLine
} from "react-icons/fa";
import "./Dashboard.css";

const sections = [
  // Existing sections
  {
    id: 1,
    title: "Primary Information",
    description: "School & Respondent Information",
    icon: <FaSchool />,
    link: "/primary-information",
  },
  {
    id: 2,
    title: "Water",
    description: "Drinking water & related information",
    icon: <FaTint />,
    link: "/Water",
  },
  {
    id: 3,
    title: "Toilet",
    description: "Toilets, Hygiene, Sanitation, and Waste Management",
    icon: <FaToilet />,
    link: "/Toilet",
  },
  {
    id: 4,
    title: "Handwashing With Soap",
    description: "Handwash Facility and Related Information",
    icon: <FaHandsWash />,
    link: "/Handwashing",
  },
  {
    id: 5,
    title: "Operations and Maintenance",
    description: "Dustbin, Liquid Waste Management and Related Information",
    icon: <FaCog />,
    link: "/OperationMaintenance",
  },
  {
    id: 6,
    title: "Behavior Change and Capacity Building",
    description: "Bal Sansad, Cultural Competitive Programs",
    icon: <FaCog />,
    link: "/capacity-building",
  },
  {
    id: 7,
    title: "Upload Images",
    description: "School Premises, Water Reports, Toilets etc.",
    icon: <FaImages />,
    link: "/upload2",
  },

  // Newly added sections
  {
    id: 8,
    title: "Climate Change & Environment Sustainability",
    description: "Environmental sustainability initiatives and climate adaptation",
    icon: <FaLeaf />,
    link: "/climate-change",
  },
  {
    id: 9,
    title: "Menstrual Hygiene",
    description: "Menstrual hygiene management and facilities",
    icon: <FaVenus />,
    // link: "/menstrual-hygiene",
  },
  {
    id: 10,
    title: "Disaster Management",
    description: "Disaster preparedness and response plans",
    icon: <FaFirstAid />,
    link: "/disaster-management",
  },
  {
    id: 11,
    title: "School Health And Wellness Programme",
    description: "Health check-ups, wellness activities, and programs",
    icon: <FaHeartbeat />,
    link: "/school-health-wellness",
  },
  {
    id: 12,
    title: "Mid Day Meal (MDM)",
    description: "Mid-day meal program details and management",
    icon: <FaUtensils />,
    link: "/midday-meal",
  },
  {
    id: 13,
    title: "Score & Rating",
    description: "School ratings and performance scores",
    icon: <FaStar />,
    link: "/score-rating",
  },
  {
    id: 14,
    title: "Progress Tracking",
    description: "Track school development and improvements",
    icon: <FaChartLine />,
    link: "/progress-tracking",
  }
];

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSectionClick = (link) => {
    if (link) {
      navigate(link);
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem("authToken");
  //   navigate("/login");
  // }; 

  return (
    <div className="dashboard-container">
      <div className="dashboard-sections">
        {sections.map((section) => (
          <div
            key={section.id}
            className="dashboard-item"
            onClick={() => handleSectionClick(section.link)}
          >
            <div className="icon">{section.icon}</div>
            <div className="content">
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>
          </div>
        ))}
      </div>
       {/* <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>  */}
    </div>
  );
};

export default Dashboard;

// import React, { useEffect ,useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   FaSchool,
//   FaTint,
//   FaToilet,
//   FaHandsWash,
//   FaCog,
//   FaImages,
// } from "react-icons/fa";
// import "./Dashboard.css";
// // This is an array of objects, where each object represents a dashboard section. Each section contains:
// // id → Unique identifier
// // title → Section name
// // description → Brief details about the section
// // icon → Corresponding React Icon
// // link (optional) → clicking redirects to that page
// const sections = [
//   {
//     id: 1,
//     title: "Primary Information",
//     description: "School & Respondent Information",
//     icon: <FaSchool />,
//     link: "/primary-information",
//   },
//   {
//     id: 2,
//     title: "Water",
//     description: "Drinking water & related information",
//     icon: <FaTint />,
//     link: "/Water",
//   },
//   {
//     id: 3,
//     title: "Toilet",
//     description: "Toilets, Hygiene, Sanitation, and Waste Management",
//     icon: <FaToilet />,
//     link: "/Toilet",
//   },
//   {
//     id: 4,
//     title: "Handwashing With Soap",
//     description: "Handwash Facility and Related Information",
//     icon: <FaHandsWash />,
//     link: "/Handwashing",
//   },
//   {
//     id: 5,
//     title: "Operations and Maintenance",
//     description: "Dustbin, Liquid Waste Management and Related Information",
//     icon: <FaCog />,
//     link: "/OperationMaintenance",
//   },
//   {
//     id: 6,
//     title: "Behavior Change and Capacity Building",
//     description: "Bal Sansad, Cultural Competitive Programs",
//     icon: <FaCog />,
//     link: "/capacity-building",
//   },
//   {
//     id: 7,
//     title: "Upload Images",
//     description: "School Premises, Water Reports, Toilets etc.",
//     icon: <FaImages />,
//     image: "/images/upload.jpg",
//     link:"/upload2",
//     // link: "/upload",
//   },
// ];

// const Dashboard = () => {
//   // const [selectedImage, setSelectedImage] = useState(sections[0].image); // Default image
//   const navigate = useNavigate();
//   //enhanced authentication check
//   useEffect(()=>{
//     const token = localStorage.getItem("authToken");
//     if(!token){
//       navigate("/login");
//     }
//   },[navigate]);

//   const handleSectionClick = ( link) => {
//     // setSelectedImage(image);
//     if (link) {
//       navigate(link); // Navigate to another page if there's a link without reloading
//     }
//   };

//   //logout function
//   const handleLogout = () => {
//     localStorage.removeItem("authToken");
//     navigate("/login");
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-sections">
//         {sections.map(
//           (section) => ( //Loops over the sections array (map() method).
//             <div
//               key={section.id}
//               className="dashboard-item"
//               onClick={() => handleSectionClick( section.link)}
//             >
//               <div className="icon">{section.icon}</div>
//               <div className="content">
//                 <h3>{section.title}</h3>
//                 <p>{section.description}</p>
//               </div>
//             </div>
//           )
//         )}
//       </div>
//       <button className="logout-button" onClick={handleLogout}>
//         Logout
//       </button>
//       {/* <div className="dashboard-image">
//         <img src="/poster_Instruction.webp" alt="Section Preview" />
//       </div> */}
//     </div>
//   );
// };

// export default Dashboard;
