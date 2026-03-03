import Category from "../components/shared/Category"
import NearestService from "../components/shared/NearestService"
import HeroSwiper from "../components/shared/HeroSwiper"
import ServiceList from "../components/shared/ServiceList"

const HomePage = () => {
  return (
    <main className="flex-1 px-6 py-4 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
      <HeroSwiper />
      <Category />
      <ServiceList />
      <NearestService />
    </main>
  )
}

export default HomePage
