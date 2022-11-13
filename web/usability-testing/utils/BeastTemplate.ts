class BeastTemplate {
  beastTemplateID: number
  generation: number
  dexNumber: number
  name: String
  description: String
  image: String
  imageTransparentBg: String
  rarity: String
  skin: String
  starLevel: number
  asexual: Boolean
  breedableBeastTemplateID: number
  maxAdminMintAllowed: number
  ultimateSkill: String
  basicSkills: [String]
  elements: [String]
  data: { String: String }

  constructor(
    beastTemplateID: number,
    generation: number,
    dexNumber: number,
    name: String,
    description: String,
    image: String,
    imageTransparentBg: String,
    rarity: String,
    skin: String,
    starLevel: number,
    asexual: Boolean,
    breedableBeastTemplateID: number,
    maxAdminMintAllowed: number,
    ultimateSkill: String,
    basicSkills: [String],
    elements: [String],
    data: { String: String },
  ) {
    this.beastTemplateID = beastTemplateID
    this.generation = generation
    this.dexNumber = dexNumber
    this.name = name
    this.description = description
    this.image = image
    this.imageTransparentBg = imageTransparentBg
    this.rarity = rarity
    this.skin = skin
    this.starLevel = starLevel
    this.asexual = asexual
    this.breedableBeastTemplateID = breedableBeastTemplateID
    this.maxAdminMintAllowed = maxAdminMintAllowed
    this.ultimateSkill = ultimateSkill
    this.basicSkills = basicSkills
    this.elements = elements
    this.data = data || ""
  }

  get type() {
    return "Beast Template"
  }
}

export default BeastTemplate
