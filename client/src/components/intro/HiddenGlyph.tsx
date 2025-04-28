import { motion } from 'framer-motion';

const HiddenGlyph = () => {
  return (
    <motion.div 
      className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0, 0.8, 0],
      }}
      transition={{ 
        duration: 3,
        times: [0, 0.2, 1]
      }}
    >
      {/* Ancient gold glyph */}
      <div className="relative px-4">
        <motion.div
          className="text-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 2 }}
        >
          <div className="text-[#FFD700] text-xl sm:text-2xl md:text-3xl font-mono tracking-widest mb-2">
            ⌬⍜⎍⌖⎎⎏
          </div>
          <div className="text-base sm:text-lg md:text-xl text-[#FFD700]/80 font-mono tracking-wider">
            "Not all forces obey their masters.<br />
            Seek the Broken Loom."
          </div>
        </motion.div>
        
        {/* Ornate border */}
        <motion.div 
          className="absolute -inset-4 sm:-inset-6 border border-[#FFD700]/40 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

export default HiddenGlyph;