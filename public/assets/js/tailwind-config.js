tailwind.config = {
    theme: {
        fontFamily: {
            'Poppins': 'Poppins'
        },

        extend: {
            fontSize: {
                "22px":"22px",
                "26px":"26px",
                "28px":"28px",
                "32px":"32px",
                "38px":"38px",
                "40px":"40px",
                "46px":"46px"
            },
            colors: {
                "primary": "#2563eb",
                "black": "#111111",
                "secondary": "#eff6ff",
                "white": "#ffffff",
                "gray-100": "#5E636C",
                "gray-200": "#999DA5",
                "black-900": "#070127",
                "gray-400":"#F1F3F5",
                "gray-900":"#2E4E73",
                "white-300":"#F7F7EE",
                "black-100":"#131416",
                "red-100":'#F4EDED',
                'gray-800':'#818B9D',
                'sky-200':'#E4EAF3',
                'sky-300':'#757C9D',
                'primary-100':"#E0DBFB",
                "gray-700":"#E8E6FC",
                'black-300':'#000000',
                'primary-light':'#dac2fe',
                'dark-100':'#1B1920',
                "white-100":'#F9F9F9',
                'dark-200':'#99999A'
            },
            backgroundImage: {
                'contact-bg':'../assets/images/contact-bg.png',
                'asked-bg':'../assets/images/asked-bg.png',
                'trusted-bg':'../assets/images/trusted-bg.png',
                'choose-after-1':'../assets/images/choose-after.png',
                'choose-after-2':'../assets/images/choose-after-2.png',
                'step-after':'../assets/images/setp-after.png',
                'choose-1':"../assets/images/choose-bg.png",
            },
            boxShadow: {
                'shadow-1':'0px 10px 24px 0px #8635FD1A',
                'shadow-2':'0px 0px 15px 0px #0000001A',
                'shadow-3': '0px 3.39px 11.87px 0px #00000040',
                'shadow-4': '0px 2.48px 28.06px 0px #00000017',
                'shadow-5': '0px 3.79px 13.28px 0px #00000040',
                'shadow-6':'0px 2px 8px #0000001c'
            },
            keyframes: {
               upDown: {
                  '0%': { transform: 'translateY(0px)' },
                  '100%': { transform: 'translateY(-15px)' },
                },
                leftRight: {
                    '0%': { transform: 'translateX(0px)' },
                    '100%': { transform: 'translateX(-15px)' },
                  },
                  rightLeft: {
                    '0%': { transform: 'translateX(0px)' },
                    '100%': { transform: 'translateX(7px)' },
                  },
                  zoomIn:{
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(0.8)' },
                  },
                  rotate:{
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
              },
              animation: {
               upDown: 'upDown 3s ease-in-out infinite alternate',
               leftRight: 'leftRight 3s ease-in-out infinite alternate',
               rightLeft: 'rightLeft 1s ease-in-out infinite alternate',
               zoomIn: 'zoomIn 3s ease-in-out infinite alternate',
               rotate: 'rotate 15s ease-in-out infinite normal',
              },
              rotate: {
                '70deg': '70deg',
              },
              aspectRatio: {
                '598/593':'598/593',
                '399/228':"399/228",
                '671/516':'671/516'
              },
        },

    }
};