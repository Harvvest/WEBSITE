// HARVVEST Stock Market Institution — Student Video Reviews Data
//
// Leave STUDENT_REVIEWS empty (`[]`) until real student video reviews are provided.
// When student reviews are added here, both Home (compact review preview) and the Student Life page
// (full review collection) will automatically render them.
// If the array is empty, all Student Video Reviews sections and public navigation links to reviews remain cleanly hidden.
//
// Schema for each review entry:
// {
//   id: "review-01",                               // Unique review ID
//   videoUrl: "https://... or /videos/review1.mp4",// Actual video file path or supported video URL (e.g. MP4, WebM, YouTube, Vimeo)
//   thumbnail: "/images/reviews/student1.jpg",     // Actual thumbnail image path
//   studentName: "Student Name",                   // Optional student name supplied by user (or omit)
//   caption: "Batch of March 2026",                // Optional caption supplied by user (or omit)
//   orientation: "portrait" | "landscape"          // Optional orientation hint ("portrait" [default for shorts/reels/phone clips] or "landscape")
// }

window.HARVVEST_STUDENT_REVIEWS = [];
