// append-random-passage.js
const fs = require("fs");
const path = require("path");

const contentPath = path.join(__dirname, "lib/actions/content.ts");
let contentCode = fs.readFileSync(contentPath, "utf8");

const newFunc = `
export async function getRandomPassage(options?: { minWords?: number, maxWords?: number, difficulty?: string }) {
  try {
    await connectDB();
    const query: any = {};
    if (options?.difficulty) query.difficulty = options.difficulty;
    if (options?.minWords || options?.maxWords) {
      query.wordCount = {};
      if (options.minWords) query.wordCount.$gte = options.minWords;
      if (options.maxWords) query.wordCount.$lte = options.maxWords;
    }

    const count = await Passage.countDocuments(query);
    if (count === 0) {
      const anyPassage = await Passage.aggregate([{ $sample: { size: 1 } }]);
      return anyPassage.length > 0 ? JSON.parse(JSON.stringify(anyPassage[0])) : null;
    }

    const random = await Passage.aggregate([
      { $match: query },
      { $sample: { size: 1 } }
    ]);

    return random.length > 0 ? JSON.parse(JSON.stringify(random[0])) : null;
  } catch (error) {
    console.error("Failed to fetch random passage:", error);
    return null;
  }
}
`;

if (!contentCode.includes("getRandomPassage")) {
    fs.appendFileSync(contentPath, newFunc);
    console.log("Added getRandomPassage to lib/actions/content.ts");
} else {
    console.log("getRandomPassage already exists");
}

const glob = fs.readdirSync(path.join(__dirname, "app/drills"));

for (const drill of glob) {
    const p = path.join(__dirname, "app/drills", drill, "page.tsx");
    if (fs.existsSync(p)) {
        let code = fs.readFileSync(p, "utf8");

        // Add import
        if (!code.includes("getRandomPassage")) {
            code = code.replace(
                /import\s+\{\s*passages\s*\}\s+from\s+"@\/lib\/passages"/g,
                'import { getRandomPassage } from "@/lib/actions/content"'
            );
        }

        // Fix any stray useState(null)
        code = code.replace(/useState\(null\)/g, "useState<any>(null)");

        // Change useEffect
        const useEffectStart = code.indexOf("useEffect(() => {");
        if (useEffectStart !== -1) {
            const effectParamEnd = code.indexOf("}, [])", useEffectStart) + 6;
            if (effectParamEnd > 6) {
                let replaceStr = `useEffect(() => {
    async function fetchPassage() {
      try {
        const selectedPassage = await getRandomPassage();
        if (!selectedPassage) {
          setPassage(fallbackPassage);
          setIsLoading(false);
          return;
        }
        
        const formattedPassage = {
          id: selectedPassage._id,
          title: selectedPassage.title,
          text: selectedPassage.content,
          content: selectedPassage.content,
          topic: selectedPassage.category,
          category: selectedPassage.category,
          difficulty: selectedPassage.difficulty,
          wordCount: selectedPassage.wordCount,
          estimatedTime: selectedPassage.estimatedTime,
        }
        setPassage(formattedPassage);
      } catch (error) {
        console.error("Error getting passage:", error);
        setPassage(fallbackPassage);
      }
      setIsLoading(false);
    }
    fetchPassage();
  }, [])`;
                code = code.substring(0, useEffectStart) + replaceStr + code.substring(effectParamEnd);
            }
        }

        fs.writeFileSync(p, code);
        console.log("Refactored " + drill);
    }
}
