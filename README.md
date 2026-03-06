# AR Drawing Canvas 🎨✨

An interactive augmented reality drawing application that lets you draw in the air using just your hands! This web-based project uses real-time hand tracking to create digital art through natural hand gestures—no controllers or special hardware needed.

## 🌟 Features

- **Hand Gesture Recognition** - Draw using your index finger, detected through your webcam
- **Real-time Drawing** - Smooth, responsive drawing with position smoothing
- **Color Palette** - Choose from 7 vibrant colors including neon green, cyan, magenta, and more
- **Adjustable Brush Sizes** - Three different brush sizes (2px, 4px, 8px) for different stroke styles
- **Eraser Tool** - Switch to eraser mode to fix mistakes
- **Gesture Controls**:
  - Index finger extended = Draw
  - Open hand (hold 1s) = Clear canvas
  - Hand away = Stop drawing
- **Visual Feedback** - Hand overlay and gesture indicators to help you see what the camera detects

## 🚀 Technologies Used

- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **MediaPipe Hand Tracking** - Google's hand landmark detection
- **Tailwind CSS** - Styling
- **shadcn/ui** - Beautiful UI components
- **HTML5 Canvas** - Drawing surface

## 📦 Installation

1. Clone this repository:
```bash
git clone https://github.com/Yanshu04/AR-Drawing-Canvas.git
cd AR-Drawing-Canvas
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

5. **Grant camera permissions** when prompted!

## 🎯 How to Use

1. Make sure you're in a well-lit environment
2. Position yourself in front of your webcam
3. Allow camera access when prompted
4. Extend your index finger and point to draw
5. Open your hand fully and hold for 1 second to clear the canvas
6. Use the toolbar on the left to:
   - Select different colors
   - Adjust brush size
   - Toggle eraser mode
   - Undo last stroke
   - Clear entire canvas

## 🛠️ Project Structure

```
src/
├── components/
│   ├── ARDrawingCanvas.tsx    # Main canvas component
│   ├── DrawingToolbar.tsx     # Drawing tools sidebar
│   ├── GestureIndicator.tsx   # Shows current gesture
│   ├── HandOverlay.tsx        # Visualizes hand landmarks
│   └── ui/                    # Reusable UI components
├── hooks/
│   └── useHandTracking.ts     # Hand tracking logic
├── pages/
│   └── Index.tsx              # Main page
└── lib/
    └── utils.ts               # Utility functions
```

## 🎨 How It Works

1. **Camera Feed** - Captures video from your webcam
2. **Hand Detection** - MediaPipe processes each frame to detect hand landmarks (21 points per hand)
3. **Gesture Recognition** - Custom logic interprets finger positions to determine gestures
4. **Position Smoothing** - Applies smoothing algorithm to reduce jitter
5. **Canvas Rendering** - Draws smooth curves using quadratic Bezier interpolation
6. **Real-time Updates** - React state management keeps UI in sync

## 🔮 Future Improvements

- [ ] Save and export drawings as images
- [ ] Redo functionality
- [ ] Drawing shapes (circles, squares, straight lines)
- [ ] Multiple layers support
- [ ] Two-hand gestures for zoom/pan
- [ ] Custom background images
- [ ] Recording drawing process as video
- [ ] Share drawings via social media
- [ ] Collaborative drawing sessions

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created by Yanshu

## 🙏 Acknowledgments

- Google MediaPipe team for the hand tracking model
- shadcn for the beautiful UI components
- The React community for amazing tools and libraries

---

**Note**: This app requires a modern browser with WebRTC support and camera access. Best performance on Chrome/Edge.
