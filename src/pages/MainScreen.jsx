import { Box, Divider } from "@mui/material";
import Header from "../components/Header"
import Banner from "../components/Banner";
import Categories from "../components/Categories";
import NewArrivals from "../components/NewArrivals";
import TopBrand from "../components/TopBrand";
import Footer from "../components/Footer/Footer";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MainScreen() {
  const navigate = useNavigate();
  useEffect(() => {
    const userid = localStorage.getItem("userid");
    if (userid && userid == 1) {
      navigate("/staff");
    }
  }, [navigate]);
  return (
    <Box sx={{ width: "99vw", overflowX: "hidden" }}>
      <Header />
      <Banner />
      <Categories />
      <TopBrand />
      <NewArrivals />
      <Divider sx={{ mx: 10, my: 3 }} />     
      <Footer />
    </Box>
  );
}
