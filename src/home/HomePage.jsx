import Category from "../components/shared/Category"
import NearestService from "../components/shared/NearestService"
import Footer from "../components/shared/Footer"
import Header from "../components/shared/Header"
import HeroSwiper from "../components/shared/HeroSwiper"
import ServiceList from "../components/shared/ServiceList"

const HomePage = () => {
  return (
    <div className="min-h-screen  bg-bg-app">
      <Header user={true} />
      <main className="py-4 px-6 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
        <HeroSwiper />
        <Category />
        <ServiceList />
        <NearestService />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage
