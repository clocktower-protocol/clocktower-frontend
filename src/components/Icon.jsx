const Icon = ({ icon: TheIcon, ...props }) => {
    //const { icon } = props
    //const TheIcon = icon

    if (!TheIcon) {
        console.warn('Invalid or undefined icon prop:', TheIcon);
        return null;
      }
    return (<TheIcon {...props} />)
}


export default Icon