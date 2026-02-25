import Header from "../components/Header"
import HeroSwiper from "../components/HeroSwiper"

const HomePage = () => {
  return (
    <div className="min-h-screen  bg-(--bg-app)">
      <Header user={true}/>
      <main className="py-4 px-6 sm:px-10 md:px-20 lg:px-32 xl:px-48 2xl:px-64">
        <HeroSwiper  />
      </main>
    </div>
  )
}

export default HomePage
