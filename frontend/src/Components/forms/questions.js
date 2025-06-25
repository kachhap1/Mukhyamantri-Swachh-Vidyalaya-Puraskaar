const questions = [
    {
      id: "1.1",
      question: "U-DISE Code",
      type: "text",
    },
    {
      id: "1.2",
      question: "Name of School (prefilled with UDISE)",
      type: "text",
    },
    {
      id: "1.3",
      question: "District (prefilled with UDISE)",
      type: "text",
    },
    {
      id: "1.4",
      question: "Block (prefilled with UDISE)",
      type: "text",
    },
    {
      id: "1.5",
      question: "Panchayat",
      type: "text",
    },
    {
      id: "1.6",
      question: "Village",
      type: "text",
    },
    {
      id: "1.7",
      question: "Category of School (prefilled with UDISE)",
      type: "radio",
      options: [
        "Government schools",
        "Kasturba Gandhi Balika Vidyalaya (KGBV)",
        "Netaji Subhash Chandra Bose Avaasiy Vidyalaya (NSCBAV)",
        "Govt- CM SoE schools",
        "Govt- Block Level Aadarsh Vidyalay",
        "Govt- PM Shree school",
        "Govt- Ekalavya Model Residential School",
        "Government-aided Schools",
        "Kendriya Vidyalaya",
        "Navodya Vidyalaya (JNV)",
        "Sainik School",
        "Private Schools",
        "Others",
      ],
    },
    {
      id: "1.8",
      question: "Category of school (prefilled with UDISE)",
      type: "radio",
      options: [
        "Primary only with grades 1-5",
        "Upper primary with grades 1-8",
        "Higher secondary with grades 1-12",
        "Upper Primary only with grades 6-8",
        "Higher secondary with grades 6-12",
        "Secondary/ Sr. Secondary with grades 1-10",
        "Secondary/ Sr. Secondary with grades 6-10",
        "Secondary/ Sr. Secondary only with grades 9 & 10",
        "Higher secondary with grade 9-12",
        "Higher secondary/ Jr. College only with grades 11 & 12",
      ],
    },
  ];
  
  export default questions;
  